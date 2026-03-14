import {
  buildCallout,
  buildEmailShell,
  buildMetricGrid,
  buildTable,
} from "./email-layout.template";

export function buildRenewalEmail(params: {
  userName: string;
  appUrl: string;
  items: Array<{
    name: string;
    amount: string;
    when: string;
    chargeDate: string;
  }>;
}) {
  const body = [
    buildMetricGrid([
      {
        label: "Renewals in view",
        value: String(params.items.length),
        tone: "#1d4ed8",
      },
      {
        label: "Next charge",
        value: params.items[0]?.chargeDate ?? "No upcoming renewals",
      },
    ]),
    buildCallout({
      title: "Review before the billing date",
      body: "Pause, cancel, or downgrade anything you do not want to renew automatically.",
      tone: "info",
    }),
    buildTable({
      headers: ["Subscription", "Charge date", "Amount", "Timing"],
      rows: params.items.map((item) => [
        item.name,
        item.chargeDate,
        item.amount,
        item.when,
      ]),
    }),
  ].join("");

  return buildEmailShell({
    title: "Upcoming renewals",
    intro: `Hi${params.userName ? ` ${params.userName}` : ""}. These subscriptions are approaching their next billing date.`,
    body,
    footer: "You are receiving renewal reminders from ControlMe. ",
    appUrl: params.appUrl,
    ctaPath: "/dashboard",
    eyebrow: "Renewal reminder",
    preheader: "Upcoming subscription renewals to review before they charge.",
  });
}
