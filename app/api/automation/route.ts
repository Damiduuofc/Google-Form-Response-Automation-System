import { NextResponse } from "next/server";
import {
  getAutomationState,
  startAutomationBatch,
  stopAutomation,
  resetAutomation
} from "@/app/lib/automation";

// Dynamic API route: always return fresh in-memory data
export const dynamic = "force-dynamic";

export async function GET() {
  const state = getAutomationState();
  const remaining = Math.max(0, state.total - state.completed);

  return NextResponse.json({
    running: state.running,
    status: state.status,
    formUrl: state.formUrl,
    total: state.total,
    completed: state.completed,
    successful: state.successful,
    failed: state.failed,
    remaining,
    startedAt: state.startedAt,
    logs: state.logs
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, formUrl, count, delayMs } = body;

    if (action === "start") {
      if (!formUrl || typeof formUrl !== "string" || !formUrl.trim()) {
        return NextResponse.json(
          { error: "A valid Google Form URL is required." },
          { status: 400 }
        );
      }

      const totalResponses = Number(count) || 10;
      if (totalResponses < 1 || totalResponses > 100) {
        return NextResponse.json(
          { error: "Response count must be between 1 and 100." },
          { status: 400 }
        );
      }

      const delay = Number(delayMs) || 1500;
      const result = await startAutomationBatch(formUrl.trim(), totalResponses, delay);

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message });
    }

    if (action === "stop") {
      const result = stopAutomation();
      return NextResponse.json({ success: result.success, message: result.message });
    }

    if (action === "reset") {
      const result = resetAutomation();
      return NextResponse.json({ success: result.success, message: result.message });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'start', 'stop', 'reset'." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
