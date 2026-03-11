"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Bell, CreditCard, PlusCircle } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "Add subscriptions",
    desc: "Netflix, Spotify, AWS, anything recurring",
  },
  {
    icon: Bell,
    title: "Get smart alerts",
    desc: "ControlMe warns you before upcoming charges",
  },
  {
    icon: BarChart2,
    title: "See the full picture",
    desc: "Review trends, category mix, and savings potential",
  },
];

export function OnboardingEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4ADE80]/20 bg-[#4ADE80]/10">
        <CreditCard size={28} className="text-[#4ADE80]" />
      </div>

      <h2 className="mb-3 text-3xl font-black tracking-tight text-[#F9FAFB]">
        Welcome to ControlMe
      </h2>
      <p className="mb-10 max-w-md text-base leading-relaxed text-[#9CA3AF]">
        You&apos;re all set. Add your first subscription to start tracking recurring spend and
        surface useful alerts.
      </p>

      <div className="mb-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="glass-light rounded-2xl p-5 text-left">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4ADE80]/15 text-[10px] font-bold text-[#4ADE80]">
                  {index + 1}
                </div>
                <Icon size={16} className="text-[#4ADE80]" />
              </div>
              <p className="text-sm font-semibold text-[#F9FAFB]">{step.title}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">{step.desc}</p>
            </div>
          );
        })}
      </div>

      <Link
        href="/subscriptions/new"
        className="inline-flex items-center gap-2 rounded-xl bg-[#4ADE80] px-8 py-3.5 font-bold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90"
      >
        <PlusCircle size={18} />
        Add your first subscription
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
