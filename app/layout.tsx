import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ControlMe - Open Source Subscription Tracker",
    template: "%s | ControlMe",
  },
  description:
    "ControlMe is an open-source web project for tracking subscriptions and recurring expenses, reviewing renewals, and exporting your data.",
  keywords: ["open source subscription tracker", "recurring expenses", "subscription tracker", "expense visibility"],
  authors: [{ name: "ControlMe" }],
  creator: "ControlMe",
  metadataBase: new URL("https://controlme.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://controlme.app",
    title: "ControlMe - Open Source Subscription Tracker",
    description:
      "A public open-source web project for tracking subscriptions, recurring payments, upcoming renewals, and expense history.",
    siteName: "ControlMe",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ControlMe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ControlMe - Open Source Subscription Tracker",
    description: "An open-source web project for recurring expense and subscription tracking.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
