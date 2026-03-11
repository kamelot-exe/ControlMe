"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart2,
  Bell,
  CheckCircle2,
  CreditCard,
  Download,
  FolderOpen,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMe } from "@/hooks/use-auth";

const features = [
  {
    icon: CreditCard,
    color: "#38BDF8",
    title: "Track recurring payments",
    desc: "Keep streaming services, software renewals, memberships, and other recurring costs in one place.",
  },
  {
    icon: Bell,
    color: "#F59E0B",
    title: "See upcoming charges",
    desc: "Review what is about to renew so monthly spending does not catch you by surprise.",
  },
  {
    icon: BarChart2,
    color: "#38BDF8",
    title: "Understand spending patterns",
    desc: "Use category and monthly views to see where recurring expenses are growing.",
  },
  {
    icon: Shield,
    color: "#4ADE80",
    title: "Reduce waste",
    desc: "Spot duplicate tools, inactive services, and subscriptions that no longer justify their cost.",
  },
  {
    icon: Download,
    color: "#8B5CF6",
    title: "Export your data",
    desc: "Download CSV and PDF summaries when you want a portable record of your expenses.",
  },
  {
    icon: FolderOpen,
    color: "#F87171",
    title: "Open source foundation",
    desc: "This web project is public and open source, so the codebase can be inspected, improved, and self-hosted.",
  },
];

const highlights = [
  "Free web application",
  "Open source codebase",
  "Recurring expense visibility",
  "Exports and analytics included",
];

export default function HomePage() {
  const router = useRouter();
  const { data: userData, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && userData?.data) {
      router.push("/dashboard");
    }
  }, [userData, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-64 h-32 skeleton rounded-2xl" />
      </div>
    );
  }

  if (userData?.data) return null;

  return (
    <div className="min-h-screen text-[#F9FAFB] overflow-x-hidden">
      <header
        className="sticky top-0 z-50 border-b border-white/8"
        style={{ background: "rgba(6,11,22,0.85)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center">
              <Zap size={14} className="text-[#4ADE80]" />
            </div>
            <span className="font-bold text-[#F9FAFB] tracking-tight">ControlMe</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-sm font-semibold bg-[#4ADE80] text-[#060B16] px-4 py-2 rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97]"
            >
              Create account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-28 pb-32 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 glass-light px-3 py-1.5 rounded-full mb-8">
          <Sparkles size={12} className="text-[#38BDF8]" />
          <span className="text-xs font-medium text-[#38BDF8] tracking-wide">
            Open source recurring expense tracker
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
          ControlMe is a free
          <br />
          web project for tracking
          <br />
          subscriptions and renewals
        </h1>

        <p className="text-lg md:text-xl text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed">
          It helps you record recurring expenses, review upcoming charges, and understand
          how subscription spending changes over time. The public web version is open source
          and designed for people who want a simple, inspectable alternative to opaque finance tools.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <Link
            href="/register"
            className="flex items-center gap-2 text-base font-bold bg-[#4ADE80] text-[#060B16] px-7 py-3.5 rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97]"
          >
            Open the app <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-base font-medium glass px-7 py-3.5 rounded-xl hover:border-white/30 transition-all duration-150"
          >
            Sign in
          </Link>
        </div>

        <p className="text-sm text-[#6B7280] mt-8 tracking-wide">
          Public web project · Open source · Built for recurring cost clarity
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest text-[#38BDF8] uppercase mb-4">Project Overview</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            What this project does
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-hover p-6 rounded-3xl">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
                >
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-[#F9FAFB] text-base mb-1.5">{feature.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-32 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest text-[#4ADE80] uppercase mb-4">Why It Exists</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">A simpler way to watch subscriptions</h2>
          <p className="text-[#9CA3AF] mt-4 text-lg">
            ControlMe is built for visibility: what you pay, when it renews, and whether it still deserves a place in your budget.
          </p>
        </div>

        <div className="glass-hover p-8 rounded-3xl flex flex-col max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-[#9CA3AF] uppercase mb-4">Included</p>
          <ul className="space-y-3 flex-1">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[#F9FAFB]/90">
                <CheckCircle2 size={16} className="text-[#4ADE80] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 flex items-center justify-center gap-2 text-sm font-bold bg-[#4ADE80] text-[#060B16] py-3 rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97]"
          >
            Try the web app <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="glass-hover p-12 md:p-16 rounded-3xl text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight">Use it, inspect it, improve it</h2>
          <p className="text-[#9CA3AF] mt-4 text-base leading-relaxed max-w-lg mx-auto">
            The public web app is meant to be useful on its own and clear enough to understand as a codebase.
            It is a practical tool first, and an open-source project second.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-8 text-base font-bold bg-[#4ADE80] text-[#060B16] px-8 py-3.5 rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97]"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 py-8 text-center space-y-3">
        <div className="flex gap-6 justify-center text-xs text-[#6B7280]">
          <Link href="/terms" className="hover:text-[#9CA3AF] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#9CA3AF] transition-colors">Privacy</Link>
        </div>
        <p className="text-sm text-[#6B7280]">© 2026 ControlMe. Open source visibility for recurring expenses.</p>
      </footer>
    </div>
  );
}
