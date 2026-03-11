"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useForgotPassword } from "@/hooks/use-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  // In dev mode the backend returns the token directly — show it for convenience
  const [devToken, setDevToken] = useState<string | null>(null);

  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      const result = await forgotPassword.mutateAsync({ email: email.trim().toLowerCase() });
      setSent(true);
      if (result.data?.token) {
        setDevToken(result.data.token);
      }
    } catch {
      // Always show "sent" to avoid email enumeration
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>

        <div className="glass rounded-3xl p-8">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#4ADE80]/15 border border-[#4ADE80]/25 flex items-center justify-center">
                  <CheckCircle size={26} className="text-[#4ADE80]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Check your inbox</h1>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                If <span className="text-[#F9FAFB]">{email}</span> is registered, you&apos;ll receive a
                password reset link within a few minutes.
              </p>

              {/* Dev mode helper */}
              {devToken && (
                <div className="mt-4 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl text-left">
                  <p className="text-xs font-semibold text-[#F59E0B] mb-1">Dev mode — token returned directly:</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="text-xs text-[#38BDF8] hover:underline break-all"
                  >
                    /reset-password?token={devToken}
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-block mt-2 text-sm text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/25 flex items-center justify-center">
                  <Mail size={18} className="text-[#38BDF8]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#F9FAFB] tracking-tight">Forgot password?</h1>
                  <p className="text-xs text-[#9CA3AF]">We&apos;ll send you a reset link</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[#F97373] bg-[#F97373]/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={forgotPassword.isPending}
                  className="w-full py-3 bg-[#4ADE80] text-[#060B16] font-bold rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
                >
                  {forgotPassword.isPending ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
