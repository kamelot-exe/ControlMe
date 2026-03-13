import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the free web version of ControlMe.",
};

export default function TermsPage() {
  return <TermsContent />;
}
