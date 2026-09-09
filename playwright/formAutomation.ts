import { chromium, Browser, Page } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";
import { SyntheticResponse, generateTestResponse } from "../app/lib/responseGenerator";

function findChromiumExecutable(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH && fs.existsSync(process.env.PLAYWRIGHT_CHROMIUM_PATH)) {
    return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  }
  const possiblePaths = [
    path.join(os.homedir(), "Library/Caches/ms-playwright"),
    path.join(os.homedir(), ".cache/ms-playwright"),
    path.join(process.env.LOCALAPPDATA || "", "ms-playwright")
  ];

  for (const cacheDir of possiblePaths) {
    if (!fs.existsSync(cacheDir)) continue;
    try {
      const entries = fs.readdirSync(cacheDir);
      const chromiumDirs = entries.filter(e => e.startsWith("chromium-") || e.startsWith("chromium_headless_shell-"));
      for (const dir of chromiumDirs) {
        const candidates = [
          path.join(cacheDir, dir, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
          path.join(cacheDir, dir, "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
          path.join(cacheDir, dir, "chrome-headless-shell-mac-arm64/chrome-headless-shell"),
          path.join(cacheDir, dir, "chrome-linux/chrome"),
          path.join(cacheDir, dir, "chrome-win/chrome.exe")
        ];
        for (const cand of candidates) {
          if (fs.existsSync(cand)) return cand;
        }
      }
    } catch {
      // Ignore directory scan errors
    }
  }
  return undefined;
}

export interface FormSubmissionResult {
  responseIndex: number;
  success: boolean;
  message: string;
  data: SyntheticResponse;
  durationMs: number;
}

export interface AutomationCallbacks {
  onLog?: (message: string, type: "info" | "success" | "warning" | "error") => void;
  onProgress?: (completed: number, successful: number, failed: number, total: number) => void;
  isCancelled?: () => boolean;
}

/**
 * Universal Auto-Responder:
 * Automatically identifies questions, options, radio buttons, checkboxes, grids,
 * dropdowns, and text fields on ANY Google Form and answers them with randomized test data.
 */
export async function submitSingleResponse(
  page: Page,
  formUrl: string,
  responseIndex: number,
  callbacks?: AutomationCallbacks
): Promise<FormSubmissionResult> {
  const startTime = Date.now();
  const testData = generateTestResponse(responseIndex);

  callbacks?.onLog?.(`→ Preparing response ${responseIndex} [${testData.name}]...`, "info");

  try {
    // Navigate to form URL with sensible timeout
    await page.goto(formUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
    await page.waitForTimeout(1500);

    // Check cancellation
    if (callbacks?.isCancelled && callbacks.isCancelled()) {
      return {
        responseIndex,
        success: false,
        message: "Automation cancelled by user",
        data: testData,
        durationMs: Date.now() - startTime
      };
    }

    await page.waitForSelector("body", { timeout: 10000 }).catch(() => {});

    // Check if the form requires Google Account Sign-In / Login
    const signInRequired = await page.evaluate(() => {
      const text = document.body ? (document.body.innerText || "") : "";
      const dialog = document.querySelector('[role="dialog"], .m7DUHf, .I37Gud');
      const dialogText = dialog ? ((dialog as HTMLElement).innerText || "") : "";
      return (
        text.includes("Sign in to continue") ||
        text.includes("දිගටම කරගෙන යාමට පුරන්න") ||
        text.includes("මෙම පෝරමය පිරවීමට, ඔබ පිරිය යුතුය") ||
        dialogText.includes("Sign in") ||
        dialogText.includes("පුරන්න")
      );
    }).catch(() => false);

    if (signInRequired) {
      throw new Error(
        "Form requires Google Sign-In / Authentication. In your Google Form: click Settings -> Responses, turn OFF 'Limit to 1 response' and set 'Collect email addresses' to 'Do not collect' so responses can be submitted publicly without login."
      );
    }

    // Loop through form pages (handles single-page and multi-page forms)
    let pageNumber = 1;
    const maxPages = 10;

    while (pageNumber <= maxPages) {
      if (callbacks?.isCancelled && callbacks.isCancelled()) break;

      callbacks?.onLog?.(`→ Scanning page ${pageNumber} questions...`, "info");

      // ========================================================
      // 1. Google Forms Top-Level Question Cards (.Qr7Oae)
      // ========================================================
      const googleFormCards = await page.$$(".Qr7Oae:visible");

      if (googleFormCards.length > 0) {
        callbacks?.onLog?.(`→ Found ${googleFormCards.length} questions on page ${pageNumber}. Randomizing...`, "info");

        for (let i = 0; i < googleFormCards.length; i++) {
          if (callbacks?.isCancelled && callbacks.isCancelled()) break;

          const card = googleFormCards[i];
          const titleEl = await card.$(".M7eMe, [role=\"heading\"], .m2");
          const rawTitle = titleEl ? await titleEl.innerText().catch(() => "") : `Question ${i + 1}`;
          const cleanTitle = rawTitle.replace(/\n+/g, " ").replace(/\*/g, "").trim();

          // A. Multiple-choice Grids (multiple radiogroups in a single question card)
          const radioGroups = await card.$$("div[role=\"radiogroup\"]");
          if (radioGroups.length > 1) {
            for (let g = 0; g < radioGroups.length; g++) {
              const group = radioGroups[g];
              const radiosInGroup = await group.$$("[role=\"radio\"]");
              if (radiosInGroup.length > 0) {
                const picked = radiosInGroup[Math.floor(Math.random() * radiosInGroup.length)];
                try {
                  await picked.click({ timeout: 1500, force: true });
                } catch {
                  await picked.evaluate((el: any) => el.click());
                }
              }
            }
            callbacks?.onLog?.(`  • ${cleanTitle.substring(0, 30)}... -> [Grid rows answered]`, "info");
            await page.waitForTimeout(100);
            continue;
          }

          // B. Single Radio Group (Multiple choice, Likert 1-5 scale)
          const radios = await card.$$("[role=\"radio\"]");
          if (radios.length > 0) {
            const radioCandidates: Array<{ element: any; value: string }> = [];
            for (const r of radios) {
              const rawVal =
                (await r.getAttribute("data-value")) ||
                (await r.getAttribute("aria-label")) ||
                (await r.innerText().catch(() => "")) ||
                "";
              const lower = rawVal.toLowerCase();
              if (!lower.includes("other") && !rawVal.includes("වෙනත්") && rawVal.trim() !== "") {
                radioCandidates.push({ element: r, value: rawVal });
              }
            }

            const pool = radioCandidates.length > 0 ? radioCandidates : radios.map(r => ({ element: r, value: "Option" }));
            const selected = pool[Math.floor(Math.random() * pool.length)];

            await selected.element.scrollIntoViewIfNeeded().catch(() => {});
            try {
              await selected.element.click({ timeout: 2000, force: true });
            } catch {
              await selected.element.evaluate((el: any) => el.click());
            }

            callbacks?.onLog?.(`  • ${cleanTitle.substring(0, 30)}... -> [${selected.value.trim()}]`, "info");
            await page.waitForTimeout(100);
            continue;
          }

          // C. Checkboxes (Multiple choice selections)
          const checkboxes = await card.$$("[role=\"checkbox\"]");
          if (checkboxes.length > 0) {
            const validCheckboxes: Array<{ element: any; label: string }> = [];
            for (const cb of checkboxes) {
              const label =
                (await cb.getAttribute("aria-label")) ||
                (await cb.innerText().catch(() => "")) ||
                "";
              const lower = label.toLowerCase();
              if (!lower.includes("other") && !label.includes("වෙනත්") && label.trim() !== "") {
                validCheckboxes.push({ element: cb, label });
              }
            }

            const pool = validCheckboxes.length > 0 ? validCheckboxes : checkboxes.map(c => ({ element: c, label: "Option" }));
            const pickCount = Math.min(pool.length, Math.random() > 0.5 ? 2 : 1);
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            const chosen = shuffled.slice(0, pickCount);

            const chosenLabels: string[] = [];
            for (const cb of chosen) {
              await cb.element.scrollIntoViewIfNeeded().catch(() => {});
              try {
                await cb.element.click({ timeout: 2000, force: true });
              } catch {
                await cb.element.evaluate((el: any) => el.click());
              }
              chosenLabels.push(cb.label.trim());
              await page.waitForTimeout(100);
            }
            callbacks?.onLog?.(`  • ${cleanTitle.substring(0, 30)}... -> [${chosenLabels.join(", ")}]`, "info");
            continue;
          }

          // D. Dropdown (Listbox)
          const dropdown = await card.$("[role=\"listbox\"], div[jsname=\"LgbsSe\"]");
          if (dropdown) {
            try {
              await dropdown.click({ timeout: 2000, force: true });
            } catch {
              await dropdown.evaluate((el: any) => el.click());
            }
            await page.waitForTimeout(300);
            const options = await page.$$("[role=\"option\"]:not([data-value=\"\"])");
            if (options.length > 0) {
              const picked = options[Math.floor(Math.random() * options.length)];
              try {
                await picked.click({ timeout: 2000, force: true });
              } catch {
                await picked.evaluate((el: any) => el.click());
              }
              callbacks?.onLog?.(`  • ${cleanTitle.substring(0, 30)}... -> [Dropdown option selected]`, "info");
              await page.waitForTimeout(150);
            }
            continue;
          }

          // E. Text Inputs (Short answer or Paragraph)
          const textInput = await card.$("input[type=\"text\"]:visible, textarea:visible");
          if (textInput) {
            let textVal = testData.feedback;
            const lowerTitle = cleanTitle.toLowerCase();
            if (lowerTitle.includes("name")) textVal = testData.name;
            else if (lowerTitle.includes("email")) textVal = testData.email;
            else if (lowerTitle.includes("course") || lowerTitle.includes("year")) textVal = testData.course;
            else if (lowerTitle.includes("phone") || lowerTitle.includes("contact")) textVal = "0771234567";

            await textInput.scrollIntoViewIfNeeded().catch(() => {});
            await textInput.click().catch(() => {});
            await textInput.fill(textVal).catch(() => {});
            callbacks?.onLog?.(`  • ${cleanTitle.substring(0, 30)}... -> "${textVal}"`, "info");
            await page.waitForTimeout(150);
            continue;
          }
        }
      } else {
        // Fallback for standard HTML or local mock form
        callbacks?.onLog?.(`→ Scanning standard inputs...`, "info");

        const textInputs = await page.$$("input[type=\"text\"]:visible, div[role=\"textbox\"]:visible");
        const textareas = await page.$$("textarea:visible");

        if (textInputs.length > 0 && textInputs[0]) await textInputs[0].fill(testData.name);
        if (textInputs.length > 1 && textInputs[1]) await textInputs[1].fill(testData.course);
        if (textInputs.length > 2 && textInputs[2]) await textInputs[2].fill(testData.email);
        if (textareas.length > 0 && textareas[0]) await textareas[0].fill(testData.feedback);

        const radioGroups = await page.$$("div[role=\"radiogroup\"]:visible, .radiogroup:visible");
        for (const group of radioGroups) {
          const radios = await group.$$("div[role=\"radio\"]:visible, input[type=\"radio\"]:visible");
          if (radios.length > 0) {
            const pick = radios[Math.floor(Math.random() * radios.length)];
            try {
              await pick.click({ timeout: 2000, force: true });
            } catch {
              await pick.evaluate((el: any) => el.click());
            }
          }
        }
      }

      // Check if there is a "Next" page button (for multi-page forms)
      const nextBtn = await page.$(
        'div[role="button"][jsname="OCpkoe"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("ඉදිරියට")'
      );

      const submitBtn = await page.$(
        'div[role="button"][jsname="M2UYVd"], .uArJ5e.Y5sE8d[role="button"], div[role="button"]:has-text("Submit"), div[role="button"]:has-text("සබිමිටි"), button[type="submit"]'
      );

      if (nextBtn && (await nextBtn.isVisible()) && !submitBtn) {
        callbacks?.onLog?.(`→ Page ${pageNumber} complete. Clicking "Next" button...`, "info");
        try {
          await nextBtn.click({ timeout: 3000, force: true });
        } catch {
          await nextBtn.evaluate((el: any) => el.click());
        }
        await page.waitForTimeout(2000);
        pageNumber++;
      } else {
        // Reached final page
        break;
      }
    }

    // ========================================================
    // 2. Locate and Click Submit Button
    // ========================================================
    callbacks?.onLog?.(`→ Submitting response ${responseIndex}...`, "info");

    const submitCandidates = [
      "div[role=\"button\"][jsname=\"M2UYVd\"]",
      ".uArJ5e.Y5sE8d[role=\"button\"]",
      "div[role=\"button\"][jsname=\"OCpkoe\"]",
      "div[role=\"button\"][jsname=\"M2PVQe\"]",
      ".lRwqcd div[role=\"button\"]:not([jsname=\"X5DuWc\"])",
      "div[role=\"button\"]:has-text(\"Submit\")",
      "div[role=\"button\"]:has-text(\"සබිමිටි\")",
      "div[role=\"button\"]:has-text(\"Send\")",
      "div[role=\"button\"]:has-text(\"ඉදිරිපත්\")",
      "button[type=\"submit\"]",
      "button:has-text(\"Submit\")",
      "button:has-text(\"සබිමිටි\")",
      "#submit-btn"
    ];

    let submitted = false;
    for (const selector of submitCandidates) {
      const btn = await page.$(selector);
      if (btn && (await btn.isVisible())) {
        const isClearBtn = await btn.evaluate((el: any) => {
          if (!el) return false;
          const jsname = el.getAttribute ? el.getAttribute("jsname") || "" : "";
          const text = (el.innerText || "").toLowerCase();
          return jsname === "X5DuWc" || text.includes("clear") || text.includes("හිස් කරන්න");
        }).catch(() => false);

        if (!isClearBtn) {
          const btnLabel = (await btn.innerText().catch(() => "")).trim();
          callbacks?.onLog?.(`→ Clicking submit button: "${btnLabel || "Submit"}"`, "info");
          await btn.scrollIntoViewIfNeeded().catch(() => {});
          try {
            await btn.click({ timeout: 3000, force: true });
          } catch {
            await btn.evaluate((el: any) => el.click());
          }
          submitted = true;
          break;
        }
      }
    }

    if (!submitted) {
      const fallbackBtn = await page.getByRole("button", { name: /submit|send|සබිමිටි|ඉදිරිපත්/i }).first();
      if (await fallbackBtn.isVisible()) {
        try {
          await fallbackBtn.click({ timeout: 3000, force: true });
        } catch {
          await fallbackBtn.evaluate((el: any) => el.click());
        }
        submitted = true;
      }
    }

    if (!submitted) {
      throw new Error("Could not find a valid Submit button on the form.");
    }

    // ========================================================
    // 3. Verify Submission Confirmation (Strict Verification)
    // ========================================================
    let confirmed = false;
    try {
      const confirmationPromise = page.waitForFunction(
        () => {
          const text = document.body ? (document.body.innerText || "").toLowerCase() : "";
          const url = (window.location?.href || "").toLowerCase();
          return (
            url.includes("formresponse") ||
            url.includes("closedform") ||
            text.includes("your response has been recorded") ||
            text.includes("submit another response") ||
            text.includes("response recorded") ||
            text.includes("thank you for your response") ||
            text.includes("submission successful") ||
            text.includes("ප්‍රතිචාරය වාර්තා කරන ලදී") ||
            text.includes("වෙනත් ප්‍රතිචාරයක් ඉදිරිපත් කරන්න")
          );
        },
        { timeout: 12000 }
      );

      await confirmationPromise;
      confirmed = true;
    } catch {
      if (page.url().includes("formResponse") || page.url().includes("closedform")) {
        confirmed = true;
      } else {
        const confirmMsg = await page.$(".freebirdFormviewerViewResponseConfirmationMessage, a[href*=\"formResponse\"]");
        if (confirmMsg) confirmed = true;
      }
    }

    if (!confirmed) {
      const alerts = await page.evaluate(() => {
        if (!document.body) return [];
        return Array.from(document.querySelectorAll('[role="alert"], .RHiGI, .RGiF7, [role="dialog"]'))
          .map(el => ((el as HTMLElement)?.innerText || "").trim())
          .filter(Boolean);
      }).catch(() => []);
      throw new Error(
        alerts.length > 0
          ? `Submission rejected by Google: ${alerts.join("; ")}`
          : "Submission was not recorded by Google Forms. Google may be requiring account login or unfulfilled required inputs."
      );
    }

    const duration = Date.now() - startTime;
    callbacks?.onLog?.(`✓ Response ${responseIndex} recorded by Google (${(duration / 1000).toFixed(1)}s)`, "success");
    return {
      responseIndex,
      success: true,
      message: "Response recorded successfully",
      data: testData,
      durationMs: duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMsg = error?.message || "Unknown error during form submission";
    callbacks?.onLog?.(`✗ Response ${responseIndex} failed: ${errorMsg}`, "error");
    return {
      responseIndex,
      success: false,
      message: errorMsg,
      data: testData,
      durationMs: duration
    };
  }
}

/**
 * Runs a complete test automation session across the requested number of responses.
 */
export async function runFormAutomationBatch(
  formUrl: string,
  totalResponses: number,
  delayMs: number = 1500,
  callbacks?: AutomationCallbacks
): Promise<{
  completed: number;
  successful: number;
  failed: number;
  stopped: boolean;
}> {
  let completed = 0;
  let successful = 0;
  let failed = 0;
  let stopped = false;
  let browser: Browser | null = null;

  try {
    callbacks?.onLog?.(`🚀 Launching Playwright Chromium engine...`, "info");

    const isHeadless = process.env.HEADLESS !== "false";
    const executablePath = findChromiumExecutable();

    const launchOptions: any = {
      headless: isHeadless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    };
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    browser = await chromium.launch(launchOptions);

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: "en-US",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9"
      },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Educational Testing)"
    });

    const page = await context.newPage();

    for (let i = 1; i <= totalResponses; i++) {
      if (callbacks?.isCancelled && callbacks.isCancelled()) {
        stopped = true;
        callbacks?.onLog?.(`⏹ Automation stopped by user after ${completed} responses.`, "warning");
        break;
      }

      callbacks?.onLog?.(`[${i}/${totalResponses}] Starting test submission cycle...`, "info");

      const result = await submitSingleResponse(page, formUrl, i, callbacks);
      completed++;
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      callbacks?.onProgress?.(completed, successful, failed, totalResponses);

      // If there is an authentication error, stop further useless attempts immediately
      if (!result.success && result.message.includes("Sign-In / Authentication")) {
        callbacks?.onLog?.(`🛑 Stopping remaining batch because Google Form requires authentication.`, "error");
        stopped = true;
        break;
      }

      // Gentle educational delay between responses
      if (i < totalResponses) {
        if (callbacks?.isCancelled && callbacks.isCancelled()) {
          stopped = true;
          callbacks?.onLog?.(`⏹ Automation stopped by user.`, "warning");
          break;
        }
        await page.waitForTimeout(delayMs);
      }
    }
  } catch (err: any) {
    callbacks?.onLog?.(`✗ Engine critical error: ${err?.message || err}`, "error");
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
      callbacks?.onLog?.(`🏁 Playwright browser closed. Session finished.`, "info");
    }
  }

  return { completed, successful, failed, stopped };
}
