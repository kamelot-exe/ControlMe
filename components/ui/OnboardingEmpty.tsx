"use client";
import Link from "next/link";
import { PlusCircle, CreditCard, Bell, BarChart2, ArrowRight } from "lucide-react";

const steps = [
  { icon: CreditCard, title: "Add subscriptions", desc: "Netflix, Spotify, AWS — anything recurring" },
  { icon: Bell, title: "Get smart alerts", desc: "We'll warn you before every charge" },
  { icon: BarChart2, title: "See the full picture", desc: "Analytics, trends, and what you can save" },
];

export function OnboardingEmpty() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center mb-6">
        <CreditCard size={28} className="text-[#4ADE80]" />
      </div>

      <h2 className="text-3xl font-black tracking-tight text-[#F9FAFB] mb-3">
        Welcome to ControlMe
      </h2>
      <p className="text-[#9CA3AF] text-base max-w-md leading-relaxed mb-10">
        You're all set. Add your first subscription to start tracking your spending and get smart alerts.
      </p>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="glass-light rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#4ADE80]/15 flex items-center justify-center text-[10px] font-bold text-[#4ADE80]">
                  {i + 1}
                </div>
                <Icon size={16} className="text-[#4ADE80]" />
              </div>
              <p className="text-sm font-semibold text-[#F9FAFB]">{step.title}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{step.desc}</p>
            </div>
          );
        })}
      </div>

      <Link
        href="/subscriptions/new"
        className="inline-flex items-center gap-2 bg-[#4ADE80] text-[#060B16] font-bold px-8 py-3.5 rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97]"
      >
        <PlusCircle size={18} />
        Add your first subscription
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
