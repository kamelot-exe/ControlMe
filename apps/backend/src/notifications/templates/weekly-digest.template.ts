import {
  buildCallout,
  buildEmailShell,
  buildMetricGrid,
  buildTable,
} from "./email-layout.template";

export function buildWeeklyDigestEmail(params: {
  userName: string;
  appUrl: string;
  totalDue: string;
  highestCost: string;
  possibleSavings: string;
  overlapWarning: string;
  renewals: Array<{
    name: string;
    amount: string;
    when: string;
    chargeDate: string;
  }>;
}) {
  const parts = [
    buildMetricGrid([
      { label: "Due in 7 days", value: params.totalDue, tone: "#b45309" },
      { label: "Highest cost", value: params.highestCost },
      {
        label: "Possible savings",
        value: params.possibleSavings,
        tone: "#166534",
      },
    ]),
  ];

  if (params.overlapWarning) {
    parts.push(
      buildCallout({
        title: "Overlap detected",
        body: params.overlapWarning,
        tone: "warning",
      }),
    );
  }

  parts.push(
    buildTable({
      headers: ["Renewal", "Charge date", "Amount", "Timing"],
      rows: params.renewals.map((item) => [
        item.name,
        item.chargeDate,
        item.amount,
        item.when,
      ]),
      emptyMessage: "No renewals are scheduled in the next 7 days.",
    }),
  );

  return buildEmailShell({
    title: "Weekly subscription digest",
    intro: `Hi${params.userName ? ` ${params.userName}` : ""}. Here is the latest summary of renewals, cost concentration, and savings opportunities.`,
    body: parts.join(""),
    footer: "You are receiving the weekly ControlMe digest. ",
    appUrl: params.appUrl,
    ctaPath: "/dashboard",
    eyebrow: "Weekly digest",
    preheader: "Your weekly subscription summary is ready.",
  });
}
