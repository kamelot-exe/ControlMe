"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useAppUi } from "@/components/ui";
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
  const { language, setLanguage, languages, getLanguageLabel } = useAppUi();

  const labels = {
    EN: { Dashboard: "Dashboard", Subscriptions: "Subscriptions", Analytics: "Analytics", Settings: "Settings", SignOut: "Sign out" },
    FR: { Dashboard: "Tableau", Subscriptions: "Abonnements", Analytics: "Analyse", Settings: "Paramètres", SignOut: "Déconnexion" },
    RU: { Dashboard: "Дашборд", Subscriptions: "Подписки", Analytics: "Аналитика", Settings: "Настройки", SignOut: "Выйти" },
    UK: { Dashboard: "Дашборд", Subscriptions: "Підписки", Analytics: "Аналітика", Settings: "Налаштування", SignOut: "Вийти" },
    GE: { Dashboard: "Dashboard", Subscriptions: "Abos", Analytics: "Analysen", Settings: "Einstellungen", SignOut: "Abmelden" },
    ES: { Dashboard: "Panel", Subscriptions: "Suscripciones", Analytics: "Analítica", Settings: "Ajustes", SignOut: "Salir" },
    PT: { Dashboard: "Painel", Subscriptions: "Assinaturas", Analytics: "Análises", Settings: "Definições", SignOut: "Sair" },
    IT: { Dashboard: "Dashboard", Subscriptions: "Abbonamenti", Analytics: "Analisi", Settings: "Impostazioni", SignOut: "Esci" },
    PL: { Dashboard: "Panel", Subscriptions: "Subskrypcje", Analytics: "Analityka", Settings: "Ustawienia", SignOut: "Wyloguj" },
    TR: { Dashboard: "Panel", Subscriptions: "Abonelikler", Analytics: "Analitik", Settings: "Ayarlar", SignOut: "Çıkış" },
    UZ: { Dashboard: "Panel", Subscriptions: "Obunalar", Analytics: "Analitika", Settings: "Sozlamalar", SignOut: "Chiqish" },
  }[language];

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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#4ADE80]/30 bg-[#4ADE80]/15">
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
            const label = labels[item.label as keyof typeof labels] ?? item.label;
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
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <label className="mb-2 block px-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
            Language
          </label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as (typeof languages)[number])}
            className="app-select w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F9FAFB]"
          >
            {languages.map((item) => (
              <option key={item} value={item}>
                {item} · {getLanguageLabel(item)}
              </option>
            ))}
          </select>
        </div>

        {/* Bottom: logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-[#F87171] hover:bg-[#F87171]/8 transition-all duration-150 disabled:opacity-50"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {logout.isPending ? "Signing out..." : labels.SignOut}
          </button>
        </div>
      </aside>
    </>
  );
}
