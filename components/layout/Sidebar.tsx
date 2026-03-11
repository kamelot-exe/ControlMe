"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-60 flex flex-col z-40 border-r border-white/10 transition-transform duration-200",
          // Hidden by default, slide in when open on narrow screens
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ background: "rgba(6,11,22,0.97)", backdropFilter: "blur(20px)" }}
      >
        {/* Logo + close */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center">
              <Zap size={16} className="text-[#4ADE80]" />
            </div>
            <span className="text-lg font-bold text-[#F9FAFB] tracking-tight group-hover:text-white transition-colors">
              ControlMe
            </span>
          </Link>
          {/* Close button for drawer layout */}
          <button
            onClick={onClose}
            className="md:hidden text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20"
                    : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-[#F87171] hover:bg-[#F87171]/8 transition-all duration-150 disabled:opacity-50"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {logout.isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
