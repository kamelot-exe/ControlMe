"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CreditCard, BarChart2, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <nav className="glass rounded-2xl p-4 mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            href="/dashboard" 
            className="text-2xl font-bold text-[#F9FAFB] hover:text-white transition-colors duration-150 tracking-tight"
          >
            ControlMe
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-all duration-150 px-4 py-2 rounded-xl relative flex items-center gap-2",
                    isActive
                      ? "text-[#4ADE80] bg-[#4ADE80]/10"
                      : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4ADE80] rounded-full" />
                  )}
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-[#9CA3AF] hover:text-[#F97373] hover:bg-[#F97373]/10 transition-colors duration-150 flex items-center gap-2"
        >
          <LogOut size={16} />
          {logout.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </nav>
  );
}
