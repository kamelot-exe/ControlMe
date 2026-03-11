"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { ReactNode } from "react";
import { useAppUi } from "@/components/ui";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, setLanguage, languages } = useAppUi();

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen flex-1 md:ml-60">
        {/* Compact top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:hidden"
          style={{ background: "rgba(6,11,22,0.90)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]"
            >
              <Menu size={22} />
            </button>
            <span className="text-sm font-bold tracking-tight text-[#F9FAFB]">ControlMe</span>
          </div>

          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as (typeof languages)[number])}
            className="app-select rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#F9FAFB]"
          >
            {languages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {children}
      </main>
    </div>
  );
}
