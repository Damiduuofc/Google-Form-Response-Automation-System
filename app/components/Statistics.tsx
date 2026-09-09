"use client";

import { CheckCircle2, XCircle, Clock, BarChart3, AlertCircle, Play, Square } from "lucide-react";

interface StatisticsProps {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  remaining: number;
  status: "idle" | "running" | "stopped" | "completed" | "error";
}

export default function Statistics({
  total,
  completed,
  successful,
  failed,
  remaining,
  status
}: StatisticsProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  // Generate the text-based progress bar requested in prompt: ███████░░░ 70%
  const totalBlocks = 20;
  const filledBlocks = total > 0 ? Math.min(totalBlocks, Math.round((completed / total) * totalBlocks)) : 0;
  const emptyBlocks = totalBlocks - filledBlocks;
  const asciiProgress = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  const getStatusBadge = () => {
    switch (status) {
      case "running":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 mr-2 rounded-full bg-blue-600 animate-ping" />
            Running
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Completed
          </span>
        );
      case "stopped":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Square className="w-3 h-3 mr-1 text-amber-600" />
            Stopped
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Responses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Responses</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{total}</div>
          <div className="text-xs text-slate-500 mt-1">Batch target size</div>
        </div>

        {/* Card 2: Successful Responses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Successful</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{successful}</div>
          <div className="text-xs text-slate-500 mt-1">Recorded responses</div>
        </div>

        {/* Card 3: Failed Responses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-3xl font-bold ${failed > 0 ? "text-rose-600" : "text-slate-900"}`}>
            {failed}
          </div>
          <div className="text-xs text-slate-500 mt-1">Errors or timeouts</div>
        </div>

        {/* Card 4: Remaining Responses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{remaining}</div>
          <div className="text-xs text-slate-500 mt-1">Pending submission</div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-bold text-slate-900">Current Progress</h3>
            {getStatusBadge()}
          </div>
          <div className="text-sm font-semibold text-blue-600 font-mono">
            {completed} / {total} ({percentage}%)
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Text ASCII Representation as requested in prompt */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span>
            Progress: <span className="text-blue-600 font-bold">{asciiProgress}</span> {percentage}%
          </span>
          <span className="text-slate-400 text-[11px]">
            {status === "running" ? "Automating active..." : "Engine ready"}
          </span>
        </div>
      </div>
    </div>
  );
}
