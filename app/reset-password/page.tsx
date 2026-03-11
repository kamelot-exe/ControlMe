"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "@/hooks/use-auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPassword = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError((err as Error).message ?? "Something went wrong. Please request a new reset link.");
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#4ADE80]/15 border border-[#4ADE80]/25 flex items-center justify-center">
            <CheckCircle size={26} className="text-[#4ADE80]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Password updated!</h1>
        <p className="text-[#9CA3AF] text-sm">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/25 flex items-center justify-center">
          <Lock size={18} className="text-[#4ADE80]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#F9FAFB] tracking-tight">Set new password</h1>
          <p className="text-xs text-[#9CA3AF]">Must be at least 8 characters</p>
        </div>
      </div>

      {!token && (
        <div className="mb-4 p-3 bg-[#F97373]/10 border border-[#F97373]/30 rounded-xl text-sm text-[#F97373]">
          No reset token found. Please use the link from your email.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
            New password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
            Confirm password
          </label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150"
            placeholder="Repeat password"
          />
        </div>

        {error && (
          <p className="text-sm text-[#F97373] bg-[#F97373]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={resetPassword.isPending || !token}
          className="w-full py-3 bg-[#4ADE80] text-[#060B16] font-bold rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
        >
          {resetPassword.isPending ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>

        <div className="glass rounded-3xl p-8">
          <Suspense fallback={<p className="text-[#9CA3AF] text-sm">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
