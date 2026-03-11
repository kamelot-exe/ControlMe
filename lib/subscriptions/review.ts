import type {
  BillingPeriod,
  Subscription,
  SubscriptionReviewStatus,
} from "@/shared/types";
import { getDaysUntil, toMonthlyEquivalent } from "@/lib/utils/format";

export interface SubscriptionReviewResult {
  status: SubscriptionReviewStatus;
  score: number;
  relatedCount: number;
  label: string;
  reason: string;
  tone: "success" | "info" | "error";
}

function getMonthlyEquivalent(price: number, period: BillingPeriod) {
  return toMonthlyEquivalent(price, period);
}

export function evaluateSubscriptionReview(
  subscription: Subscription,
  allSubscriptions: Subscription[],
): SubscriptionReviewResult {
  const activeRelated = allSubscriptions.filter(
    (item) =>
      item.id !== subscription.id &&
      item.isActive &&
      subscription.isActive &&
      item.serviceGroup &&
      subscription.serviceGroup &&
      item.serviceGroup === subscription.serviceGroup,
  );

  const relatedCount = activeRelated.length + (subscription.serviceGroup ? 1 : 0);
  const monthlyEquivalent = getMonthlyEquivalent(
    subscription.price,
    subscription.billingPeriod,
  );
  const daysUntil = getDaysUntil(subscription.nextChargeDate);

  let score = subscription.needScore ?? 70;

  if (relatedCount >= 2) score -= Math.min(relatedCount * 10, 25);
  if (monthlyEquivalent >= 40) score -= 10;
  if (monthlyEquivalent >= 80) score -= 10;
  if (daysUntil <= 7 && daysUntil >= 0) score -= 5;
  if (!subscription.isActive) score -= 15;

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score >= 70) {
    return {
      status: "keep",
      score,
      relatedCount,
      label: "Keep",
      reason:
        relatedCount > 1
          ? "Still looks valuable even with overlapping services."
          : "High self-rated value for your current setup.",
      tone: "success",
    };
  }

  if (score >= 45) {
    return {
      status: "review",
      score,
      relatedCount,
      label: "Review",
      reason:
        relatedCount > 1
          ? "This group has overlap, so compare plans before the next renewal."
          : "Useful, but worth checking against price and timing.",
      tone: "info",
    };
  }

  return {
    status: "cancel_candidate",
    score,
    relatedCount,
    label: "Cancel candidate",
    reason:
      relatedCount > 1
        ? "Low need score and overlapping services make this a weak keeper."
        : "Low need score relative to current recurring cost.",
    tone: "error",
  };
}
