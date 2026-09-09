"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Square,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  FlaskConical,
  Settings2,
  ClipboardPaste,
  Zap,
  CheckCircle2
} from "lucide-react";
import Statistics from "./Statistics";
import ActivityLog from "./ActivityLog";
import { LogItem } from "@/app/lib/automation";

export default function Dashboard() {
  const [formUrl, setFormUrl] = useState("");
  const [responseCount, setResponseCount] = useState<number>(10);
  const [delayMs, setDelayMs] = useState<number>(1500);
  const [autoStartOnPaste, setAutoStartOnPaste] = useState<boolean>(true);

  // In-memory state synchronized with server
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "stopped" | "completed" | "error">("idle");
  const [total, setTotal] = useState(10);
  const [completed, setCompleted] = useState(0);
  const [successful, setSuccessful] = useState(0);
  const [failed, setFailed] = useState(0);
  const [remaining, setRemaining] = useState(10);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch state from Next.js in-memory API route
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/automation");
      if (!res.ok) return;
      const data = await res.json();
      setRunning(data.running);
      setStatus(data.status);
      setTotal(data.total);
      setCompleted(data.completed);
      setSuccessful(data.successful);
      setFailed(data.failed);
      setRemaining(data.remaining);
      setLogs(data.logs || []);
      if (!formUrl && data.formUrl) {
        setFormUrl(data.formUrl);
      }
    } catch {
      // Ignore network glitch during poll
    }
  }, [formUrl]);

  // Polling effect
  useEffect(() => {
    fetchStatus();
    const intervalTime = running ? 1000 : 3500;
    const interval = setInterval(fetchStatus, intervalTime);
    return () => clearInterval(interval);
  }, [fetchStatus, running]);

  // Shared runner function
  const triggerAutomation = async (targetUrl: string, count: number = responseCount) => {
    setErrorMessage(null);

    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setErrorMessage("Please enter or paste a valid Google Form URL.");
      return;
    }

    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          formUrl: cleanUrl,
          count,
          delayMs
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to start automation.");
      } else {
        setRunning(true);
        setStatus("running");
        fetchStatus();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while starting automation.");
    }
  };

  // Handler: Start from current input
  const handleStart = () => {
    triggerAutomation(formUrl);
  };

  // Handler: Paste from clipboard and immediately auto-respond
  const handlePasteAndAutoRespond = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.startsWith("http")) {
          setFormUrl(text.trim());
          triggerAutomation(text.trim());
          return;
        }
      }
    } catch {
      // Clipboard read blocked by browser permissions, fallback to focusing input
    }
    // Fallback: trigger with current formUrl
    if (formUrl.trim()) {
      triggerAutomation(formUrl);
    } else {
      setErrorMessage("Please paste the link into the input box below.");
    }
  };

  // Handler: Intercept paste event directly on input
  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text").trim();
    if (pastedText && autoStartOnPaste && !running && pastedText.startsWith("http")) {
      setFormUrl(pastedText);
      // Automatically trigger response generation
      setTimeout(() => {
        triggerAutomation(pastedText);
      }, 100);
    }
  };

  // Handler: Stop Automation
  const handleStop = async () => {
    try {
      await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" })
      });
      fetchStatus();
    } catch {
      // Handled in next poll
    }
  };

  // Handler: Reset Status
  const handleReset = async () => {
    try {
      await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      });
      fetchStatus();
    } catch {
      // Handled in next poll
    }
  };

  const handleUseMockForm = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const mockUrl = `${origin}/mock-form`;
    setFormUrl(mockUrl);
    if (autoStartOnPaste && !running) {
      triggerAutomation(mockUrl);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Educational Safety Warning Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start space-x-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <span className="font-bold">Educational testing only.</span> Use this system only with Google Forms you own or have permission to test.
          <p className="text-xs text-amber-700 mt-1">
            All synthetic submissions are strictly tagged as <span className="font-semibold text-amber-800">[TEST DATA]</span>. No CAPTCHAs, rate limits, or security mechanisms are bypassed.
          </p>
        </div>
      </div>

      {/* 2. One-Click Paste & Auto-Respond Feature Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-7 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-2 backdrop-blur-xs">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
              Universal Auto-Responder
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Paste Link &amp; Auto-Respond</h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Simply paste any Google Form URL. The engine automatically scans all questions, choices, scales, and grids, and begins submitting randomized responses instantly!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            <button
              onClick={handlePasteAndAutoRespond}
              disabled={running}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold text-sm text-blue-700 bg-white hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4 mr-2 text-blue-600" />
              {running ? "Automation Active..." : "Paste Link & Auto-Respond"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Automation Control Panel Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-600" />
              Form Link &amp; Batch Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste your Google Form URL or toggle instant auto-start below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseMockForm}
              type="button"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              title="Click to fill URL with built-in educational mock form"
            >
              <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Use Local Mock Form
            </button>
            <Link
              href="/mock-form"
              target="_blank"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition"
            >
              Open Form <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="mt-6 space-y-5">
          {/* Form URL Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Google Form URL
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoStartOnPaste}
                  onChange={(e) => setAutoStartOnPaste(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="font-medium text-blue-700">⚡ Auto-start immediately when link is pasted</span>
              </label>
            </div>

            <div className="relative">
              <input
                type="url"
                disabled={running}
                placeholder="Paste Google Form viewform link here (e.g. https://docs.google.com/forms/d/e/.../viewform)"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                onPaste={handleInputPaste}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 transition font-mono text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Paste any Google Form link. The engine automatically inspects all questions and submits random responses.
            </p>
          </div>

          {/* Preset Buttons & Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
            {/* Number of Responses & Quick Presets */}
            <div className="md:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Number of Responses
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[5, 10, 20, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={running}
                    onClick={() => setResponseCount(count)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      responseCount === count
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {count} Responses
                  </button>
                ))}
                <div className="flex items-center space-x-1.5 ml-auto">
                  <span className="text-xs text-slate-500">Custom:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={running}
                    value={responseCount}
                    onChange={(e) => setResponseCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-18 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Delay Interval Input */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Pacing Delay
              </label>
              <select
                disabled={running}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value={1000}>1.0s (Fast)</option>
                <option value={1500}>1.5s (Standard)</option>
                <option value={2500}>2.5s (Gentle)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {/* Start Automation Button */}
          <button
            type="button"
            onClick={handleStart}
            disabled={running || !formUrl.trim()}
            className="inline-flex items-center px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Start Automation
          </button>

          {/* Stop Automation Button */}
          <button
            type="button"
            onClick={handleStop}
            disabled={!running}
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Square className="w-4 h-4 mr-2 fill-current" />
            Stop Automation
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={running}
            className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition ml-auto"
            title="Reset metrics to zero"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Reset
          </button>
        </div>
      </div>

      {/* 4. Statistics & Progress Section */}
      <Statistics
        total={total}
        completed={completed}
        successful={successful}
        failed={failed}
        remaining={remaining}
        status={status}
      />

      {/* 5. Real-time Activity Log Section */}
      <ActivityLog logs={logs} />
    </div>
  );
}
