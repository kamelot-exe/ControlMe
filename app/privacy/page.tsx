import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for the open-source web version of ControlMe.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
