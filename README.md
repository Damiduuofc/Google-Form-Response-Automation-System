# Google Form Response Automation System

An educational testing dashboard for running authorized, synthetic submissions against Google Forms or the included local mock form. The project uses **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Lucide React**, and **Playwright**.

> [!IMPORTANT]
> Use this project only with forms that you own or have explicit permission to test. It generates synthetic values labeled `[TEST DATA]` and does not bypass CAPTCHA, authentication, rate limits, IP blocks, or bot detection.

## What It Does

- Provides a dashboard at `/` with batch controls, progress statistics, and a live activity log.
- Launches a Playwright Chromium session for each batch.
- Detects common Google Forms text fields, radio groups, checkbox groups, dropdowns, grids, multi-page navigation, and submit buttons.
- Generates randomized synthetic student and survey values in `app/lib/responseGenerator.ts`.
- Tracks state in the Next.js Node process only. There is no database or persistent response storage.
- Includes a local test form at `/mock-form`, so the complete workflow can be demonstrated without an external Google Form.

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- Chromium installed through Playwright

## Installation

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The production commands are:

```bash
npm run build
npm start
```

## Configuration

Create a `.env.local` file only when you need non-default settings:

```env
# Optional initial URL shown in the dashboard
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/your-form-id/viewform

# Optional. The default is true. Set to false to show Chromium while testing.
HEADLESS=true

# Optional Playwright executable override
PLAYWRIGHT_CHROMIUM_PATH=/path/to/Google Chrome for Testing
```

The dashboard also accepts a per-run delay in milliseconds. The API defaults to `1500` ms when no delay is supplied. `HEADLESS` is considered enabled unless its value is exactly `false`.

## Local Demonstration

1. Start the development server.
2. Open `/` and choose **Use Local Mock Form**, or open `/mock-form` directly.
3. Leave the response count between `1` and `100` and start the batch.
4. Watch the progress and activity log update as Playwright fills and submits the mock form.

The mock form contains required name, course, and satisfaction fields, plus optional email and feedback fields. It exposes standard textbox, radio, and submit semantics used by the fallback automation path.

## Authorized Google Form Testing

Use the public `/viewform` URL for a form that you control. The form must be accessible without an interactive login. In Google Forms, turn off settings that require a Google account, such as **Limit to 1 response** or mandatory email collection, when appropriate for your authorized test.

The automation uses question labels to choose suitable synthetic values, but Google Forms markup can change. A form that uses CAPTCHA, authentication, unusual custom controls, or blocked submissions will be reported as failed rather than bypassed.

## API

The dashboard communicates with `/api/automation`:

- `GET` returns the current in-memory status, counters, form URL, and latest activity logs.
- `POST { "action": "start", "formUrl": "...", "count": 3, "delayMs": 1500 }` starts a batch.
- `POST { "action": "stop" }` requests cancellation of the active batch.
- `POST { "action": "reset" }` restores the initial state when no batch is running.

Response counts must be between `1` and `100`. Only one batch can run at a time. State is lost when the server process restarts, and activity logs are limited to the latest 150 entries.

## Project Structure

```text
app/
├── page.tsx                         # Dashboard route
├── layout.tsx                       # Shared page layout and metadata
├── globals.css                      # Global styles
├── api/automation/route.ts          # GET/POST automation API
├── components/                      # Dashboard, statistics, and activity log UI
├── lib/automation.ts                # In-memory state and batch coordinator
├── lib/responseGenerator.ts         # Synthetic [TEST DATA] generator
└── mock-form/page.tsx               # Local Playwright test form
playwright/formAutomation.ts        # Browser automation and form detection
components/                          # Additional UI component files
package.json                         # Scripts and dependencies
```

## Safety and Data Handling

- Use synthetic data only; do not submit personal or sensitive information.
- No database, file-based response store, or external response archive is used.
- Stop and reset controls are available from the dashboard.
- Authentication, CAPTCHA, rate limits, and other security controls are intentionally not circumvented.
