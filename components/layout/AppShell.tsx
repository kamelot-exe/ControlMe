"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-60 min-h-screen">
        {/* Compact top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 sticky top-0 z-20"
          style={{ background: "rgba(6,11,22,0.90)", backdropFilter: "blur(12px)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-bold text-[#F9FAFB] tracking-tight">ControlMe</span>
        </div>

        {children}
      </main>
    </div>
  );
}
