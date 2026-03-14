import {
  buildCallout,
  buildEmailShell,
  buildMetricGrid,
  buildTable,
} from "./email-layout.template";

export function buildMonthlyDigestEmail(params: {
  userName: string;
  appUrl: string;
  monthlyTotal: string;
  yearlyProjection: string;
  topCategory: string;
  highestCost: string;
  possibleSavings: string;
  renewals: Array<{
    name: string;
    amount: string;
    when: string;
    chargeDate: string;
  }>;
}) {
  const body = [
    buildMetricGrid([
      { label: "Monthly total", value: params.monthlyTotal, tone: "#1d4ed8" },
      { label: "Yearly projection", value: params.yearlyProjection },
      {
        label: "Possible savings",
        value: params.possibleSavings,
        tone: "#166534",
      },
    ]),
    buildCallout({
      title: "Top spending focus",
      body: `${params.topCategory} is your heaviest category right now, and ${params.highestCost} is the most expensive subscription in your stack.`,
      tone: "info",
    }),
    buildTable({
      headers: ["Upcoming renewal", "Charge date", "Amount", "Timing"],
      rows: params.renewals.map((item) => [
        item.name,
        item.chargeDate,
        item.amount,
        item.when,
      ]),
      emptyMessage: "No renewals are scheduled in the next 30 days.",
    }),
  ].join("");

  return buildEmailShell({
    title: "Monthly subscription digest",
    intro: `Hi${params.userName ? ` ${params.userName}` : ""}. Here is the monthly rollup of your subscription spend and what deserves attention next.`,
    body,
    footer: "You are receiving the monthly ControlMe digest. ",
    appUrl: params.appUrl,
    ctaPath: "/analytics",
    eyebrow: "Monthly digest",
    preheader: "Your monthly subscription spend summary is ready.",
  });
}
