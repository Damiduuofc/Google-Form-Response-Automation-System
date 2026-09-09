import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Form Response Automation System",
  description: "Educational testing and automation system for authorized Google Forms using Next.js and Playwright.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                G
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  Google Form Response Automation
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  University Educational Testing Environment
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                Playwright + Next.js
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                In-Memory
              </span>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-medium text-slate-600">
              Google Form Response Automation System &bull; Educational Software Testing Project
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Strictly for testing authorized developer forms with synthetic test data. Zero external databases.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
