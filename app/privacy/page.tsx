import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for the open-source web version of ControlMe.",
};

const sections = [
  {
    title: "1. Overview",
    body:
      "ControlMe is an open-source web project for tracking subscriptions and recurring expenses. This Privacy Policy explains what data the web service uses and why.",
  },
  {
    title: "2. Data we use",
    body:
      "We use only the data needed to run the application. This may include your email address, hashed password, preferred currency, subscription records, recurring expense details, reminder settings, and basic server logs related to requests and errors.",
  },
  {
    title: "3. Why we use it",
    body:
      "Your data is used to authenticate your account, store the subscriptions and recurring expenses you enter, generate dashboards and analytics, create exports, and keep the service stable and secure.",
  },
  {
    title: "4. What we do not collect",
    body:
      "The public web app is not intended to collect bank credentials, card numbers, government identifiers, or unrelated sensitive personal information.",
  },
  {
    title: "5. Storage and security",
    body:
      "Account and application data are stored in the project's backend database. Passwords are stored as hashes rather than plain text. Reasonable technical measures are used to protect the service and limit access.",
  },
  {
    title: "6. Open-source code",
    body:
      "Because the web project is open source, parts of the application logic can be reviewed publicly. Public source code does not include your personal account data. Runtime data remains separate from the repository.",
  },
  {
    title: "7. Cookies and local storage",
    body:
      "The web application may use browser storage or equivalent session mechanisms to keep you signed in and preserve app state. It is not positioned as a tracking or advertising product.",
  },
  {
    title: "8. Exports and deletion",
    body:
      "Where product features allow it, you can export your data and delete your account. Deletion requests remove stored account data according to the service's retention process.",
  },
  {
    title: "9. Third parties",
    body:
      "ControlMe is not presented as a third-party advertising platform and does not exist to sell user data. Some infrastructure providers may process technical data as part of hosting, email delivery, or database operations.",
  },
  {
    title: "10. Policy updates",
    body:
      "This Privacy Policy may be updated as the project evolves. Continued use of the service after an update means the revised policy applies.",
  },
  {
    title: "11. Contact",
    body: "Questions about privacy can be sent to **privacy@controlme.app**.",
  },
];

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-bold text-[#F9FAFB] tracking-tight mb-3">Privacy Policy</h1>
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
          <Link href="/terms" className="hover:text-[#9CA3AF] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#9CA3AF] transition-colors text-[#9CA3AF]">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
