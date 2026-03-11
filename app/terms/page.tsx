import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the free web version of ControlMe.",
};

const sections = [
  {
    title: "1. Acceptance",
    body:
      "By creating an account or using ControlMe, you agree to these Terms of Service. If you do not agree, do not use the service.",
  },
  {
    title: "2. Service",
    body:
      'ControlMe is a web-based tool for tracking subscriptions and other recurring expenses. The service is provided "as is" and may change over time.',
  },
  {
    title: "3. Free access",
    body:
      "The public web version of ControlMe is available free of charge. No purchase is required to use the public website.",
  },
  {
    title: "4. Accounts",
    body:
      "You must provide a valid email address and keep your login credentials secure. You are responsible for activity that occurs under your account.",
  },
  {
    title: "5. Acceptable use",
    body:
      "You may not use the service for unlawful activity, attempt to access data that is not yours, disrupt availability, scrape the service at scale, or upload malicious content.",
  },
  {
    title: "6. Your data",
    body:
      "You retain ownership of the subscription and expense data you enter. ControlMe does not claim ownership of your content.",
  },
  {
    title: "7. Exports and deletion",
    body:
      "You can export your data where export tools are available in the product. You may also delete your account, after which your stored data will be removed according to the product's retention process.",
  },
  {
    title: "8. Availability",
    body:
      "We aim to keep the service available and stable, but uninterrupted access is not guaranteed. Features may be updated, suspended, or removed.",
  },
  {
    title: "9. No financial advice",
    body:
      "ControlMe is an organizational tool, not financial, legal, or tax advice. You remain responsible for your own financial decisions and payments.",
  },
  {
    title: "10. Liability",
    body:
      "To the maximum extent allowed by law, ControlMe is not liable for indirect, incidental, or consequential loss arising from use of the service.",
  },
  {
    title: "11. Changes",
    body:
      "These Terms may be updated from time to time. Continued use of the service after an update means you accept the revised Terms.",
  },
  {
    title: "12. Contact",
    body: "Questions about these Terms can be sent to **support@controlme.app**.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#060B16]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#F9FAFB]">
            ControlMe
          </Link>
          <Link href="/login" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
            Sign in →
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="animate-fade-in space-y-10">
          <div>
            <h1 className="text-4xl font-bold text-[#F9FAFB] tracking-tight mb-3">Terms of Service</h1>
            <p className="text-[#9CA3AF] text-sm">Last updated: March 11, 2026</p>
          </div>

          {sections.map(({ title, body }) => (
            <section key={title} className="glass rounded-3xl p-6 space-y-3">
              <h2 className="text-lg font-semibold text-[#F9FAFB]">{title}</h2>
              <div className="text-[#9CA3AF] text-sm leading-relaxed whitespace-pre-line">
                {body.split("**").map((part, i) =>
                  i % 2 === 0 ? part : <strong key={i} className="text-[#F9FAFB]">{part}</strong>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/8 py-8 text-center text-xs text-[#6B7280]">
        <div className="flex gap-6 justify-center">
          <Link href="/" className="hover:text-[#9CA3AF] transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-[#9CA3AF] transition-colors text-[#9CA3AF]">Terms</Link>
          <Link href="/privacy" className="hover:text-[#9CA3AF] transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
