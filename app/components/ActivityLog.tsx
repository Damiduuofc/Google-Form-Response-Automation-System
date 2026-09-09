"use client";

import { useRef, useEffect } from "react";
import { Terminal, Trash2, Check, ArrowRight, AlertTriangle, X } from "lucide-react";
import { LogItem } from "@/app/lib/automation";

interface ActivityLogProps {
  logs: LogItem[];
  onClearLogs?: () => void;
}

export default function ActivityLog({ logs, onClearLogs }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const renderIcon = (type: LogItem["type"]) => {
    switch (type) {
      case "success":
        return <span className="text-emerald-600 font-bold mr-2 select-none">✓</span>;
      case "error":
        return <span className="text-rose-600 font-bold mr-2 select-none">✗</span>;
      case "warning":
        return <span className="text-amber-500 font-bold mr-2 select-none">!</span>;
      default:
        return <span className="text-blue-500 font-bold mr-2 select-none">→</span>;
    }
  };

  const getTextColor = (type: LogItem["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-800 bg-emerald-50/70 border-emerald-100";
      case "error":
        return "text-rose-800 bg-rose-50/70 border-rose-100";
      case "warning":
        return "text-amber-800 bg-amber-50/70 border-amber-100";
      default:
        return "text-slate-800 bg-white border-slate-100";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Real-Time Activity Log</h3>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
            {logs.length}
          </span>
        </div>
        {onClearLogs && (
          <button
            onClick={onClearLogs}
            title="Clear logs display"
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center transition"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[360px] overflow-y-auto p-4 space-y-2 font-mono text-xs bg-slate-50/30"
      >
        {logs.length === 0 ? (
          <div className="text-slate-400 italic text-center py-8">
            No activity recorded yet. Start automation to view live logs.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start p-2.5 rounded-lg border text-[13px] leading-relaxed transition ${getTextColor(
                log.type
              )}`}
            >
              <div className="flex items-center flex-shrink-0 mt-0.5">
                {renderIcon(log.type)}
                <span className="text-slate-400 text-[11px] mr-2.5 font-sans">
                  [{log.time}]
                </span>
              </div>
              <div className="flex-grow break-all select-text">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
