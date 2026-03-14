import {
  buildCallout,
  buildEmailShell,
  buildMetricGrid,
  buildTable,
} from "./email-layout.template";

export function buildUnusedEmail(params: {
  userName: string;
  appUrl: string;
  monthlySavings: string;
  yearlySavings: string;
  items: Array<{
    name: string;
    monthlyCost: string;
    lastUsed: string;
  }>;
}) {
  const body = [
    buildMetricGrid([
      {
        label: "Possible monthly savings",
        value: params.monthlySavings,
        tone: "#166534",
      },
      {
        label: "Possible yearly savings",
        value: params.yearlySavings,
        tone: "#1d4ed8",
      },
    ]),
    buildCallout({
      title: "Unused for 30+ days",
      body: "These subscriptions have not shown recent confirmed activity and may be worth canceling or pausing.",
      tone: "warning",
    }),
    buildTable({
      headers: ["Subscription", "Monthly cost", "Last confirmed use"],
      rows: params.items.map((item) => [
        item.name,
        item.monthlyCost,
        item.lastUsed,
      ]),
    }),
  ].join("");

  return buildEmailShell({
    title: "Unused subscriptions",
    intro: `Hi${params.userName ? ` ${params.userName}` : ""}. These subscriptions look inactive and may be worth reviewing.`,
    body,
    footer: "You are receiving inactive subscription alerts from ControlMe. ",
    appUrl: params.appUrl,
    ctaPath: "/subscriptions",
    eyebrow: "Savings opportunity",
    preheader:
      "Unused subscriptions detected. Review them before the next billing cycle.",
  });
}
