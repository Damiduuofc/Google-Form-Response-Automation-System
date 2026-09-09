import { runFormAutomationBatch } from "../../playwright/formAutomation";

export interface LogItem {
  id: string;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface AutomationState {
  running: boolean;
  status: "idle" | "running" | "stopped" | "completed" | "error";
  formUrl: string;
  total: number;
  completed: number;
  successful: number;
  failed: number;
  startedAt: string | null;
  logs: LogItem[];
}

// Global in-memory state object preserved across API invocations in Next.js Node process
declare global {
  // eslint-disable-next-line no-var
  var __formAutomationState: AutomationState | undefined;
  // eslint-disable-next-line no-var
  var __formAutomationCancel: boolean | undefined;
}

function getInitialState(): AutomationState {
  return {
    running: false,
    status: "idle",
    formUrl: process.env.GOOGLE_FORM_URL || "",
    total: 10,
    completed: 0,
    successful: 0,
    failed: 0,
    startedAt: null,
    logs: [
      {
        id: "init",
        time: new Date().toLocaleTimeString(),
        message: "System initialized. Ready for educational testing.",
        type: "info"
      }
    ]
  };
}

if (!global.__formAutomationState) {
  global.__formAutomationState = getInitialState();
  global.__formAutomationCancel = false;
}

export function getAutomationState(): AutomationState {
  return global.__formAutomationState!;
}

export function addLog(message: string, type: "info" | "success" | "warning" | "error" = "info") {
  const state = global.__formAutomationState!;
  const newLog: LogItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    time: new Date().toLocaleTimeString(),
    message,
    type
  };
  // Keep last 150 log entries in memory
  state.logs = [newLog, ...state.logs].slice(0, 150);
}

export async function startAutomationBatch(
  formUrl: string,
  totalResponses: number,
  delayMs: number = 1500
): Promise<{ success: boolean; message: string }> {
  const state = global.__formAutomationState!;

  if (state.running) {
    return { success: false, message: "Automation is already running." };
  }

  // Reset counters for new run
  state.running = true;
  state.status = "running";
  state.formUrl = formUrl;
  state.total = totalResponses;
  state.completed = 0;
  state.successful = 0;
  state.failed = 0;
  state.startedAt = new Date().toISOString();
  global.__formAutomationCancel = false;

  addLog(`▶ Automation started for ${totalResponses} responses. Target: ${formUrl}`, "info");

  // Run in background so HTTP POST can respond immediately
  (async () => {
    try {
      const result = await runFormAutomationBatch(formUrl, totalResponses, delayMs, {
        onLog: (msg, type) => addLog(msg, type),
        onProgress: (comp, succ, fail, total) => {
          state.completed = comp;
          state.successful = succ;
          state.failed = fail;
          state.total = total;
        },
        isCancelled: () => !!global.__formAutomationCancel
      });

      state.running = false;
      state.status = result.stopped ? "stopped" : "completed";
      addLog(
        `🏁 Session ended. Total: ${state.completed}/${state.total}, Successful: ${state.successful}, Failed: ${state.failed}`,
        result.failed > 0 ? "warning" : "success"
      );
    } catch (err: any) {
      state.running = false;
      state.status = "error";
      addLog(`✗ Fatal error in automation process: ${err?.message || err}`, "error");
    }
  })();

  return { success: true, message: "Automation started successfully." };
}

export function stopAutomation(): { success: boolean; message: string } {
  const state = global.__formAutomationState!;

  if (!state.running) {
    return { success: false, message: "Automation is not currently running." };
  }

  global.__formAutomationCancel = true;
  state.status = "stopped";
  addLog("⏹ Stop request issued by user. Awaiting worker pause...", "warning");
  return { success: true, message: "Stop command sent." };
}

export function resetAutomation(): { success: boolean; message: string } {
  if (global.__formAutomationState?.running) {
    return { success: false, message: "Cannot reset while automation is active. Stop it first." };
  }

  const defaultUrl = process.env.GOOGLE_FORM_URL || "";
  global.__formAutomationState = {
    ...getInitialState(),
    formUrl: defaultUrl
  };
  global.__formAutomationCancel = false;

  return { success: true, message: "Automation state reset to defaults." };
}
