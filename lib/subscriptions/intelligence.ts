import type { Subscription } from "@/shared/types";
import { getUpcomingCharges, toMonthlyEquivalent, toYearlyEquivalent } from "@/lib/utils/format";
import { evaluateSubscriptionReview } from "@/lib/subscriptions/review";

function normalizeCategory(subscription: Subscription) {
  const category = subscription.category?.trim();
  const serviceGroup = subscription.serviceGroup?.trim();

  if (category && !["General", "Subscription"].includes(category)) {
    return category;
  }

  return serviceGroup || category || "Subscription";
}

export interface SubscriptionIntelligence {
  possibleSavingsMonthly: number;
  possibleSavingsYearly: number;
  cancelCandidatesCount: number;
  reviewCandidatesCount: number;
  overlapGroupsCount: number;
  overlapSubscriptionsCount: number;
  overlapMonthlyExposure: number;
  highestCostSubscription: Subscription | null;
  highestCostMonthlyEquivalent: number;
  next7DaysCount: number;
  next7DaysTotal: number;
  next30DaysCount: number;
  next30DaysTotal: number;
  topCategory: {
    name: string;
    total: number;
    count: number;
    share: number;
  } | null;
}

export function buildSubscriptionIntelligence(
  subscriptions: Subscription[],
): SubscriptionIntelligence {
  const activeSubscriptions = subscriptions.filter((item) => item.isActive);
  const upcoming7 = getUpcomingCharges(activeSubscriptions, 7);
  const upcoming30 = getUpcomingCharges(activeSubscriptions, 30);

  const reviews = activeSubscriptions.map((subscription) => ({
    subscription,
    review: evaluateSubscriptionReview(subscription, subscriptions),
    monthlyEquivalent: toMonthlyEquivalent(
      subscription.price,
      subscription.billingPeriod,
    ),
    yearlyEquivalent: toYearlyEquivalent(
      subscription.price,
      subscription.billingPeriod,
    ),
  }));

  const cancelCandidates = reviews.filter(
    (item) => item.review.status === "cancel_candidate",
  );
  const reviewCandidates = reviews.filter(
    (item) => item.review.status === "review",
  );

  const overlaps = new Map<string, { count: number; monthlyExposure: number }>();
  const categoryMap = new Map<string, { total: number; count: number }>();

  for (const item of reviews) {
    if (item.subscription.serviceGroup) {
      const existing = overlaps.get(item.subscription.serviceGroup) ?? {
        count: 0,
        monthlyExposure: 0,
      };
      overlaps.set(item.subscription.serviceGroup, {
        count: existing.count + 1,
        monthlyExposure: existing.monthlyExposure + item.monthlyEquivalent,
      });
    }

    const category = normalizeCategory(item.subscription);
    const existingCategory = categoryMap.get(category) ?? { total: 0, count: 0 };
    categoryMap.set(category, {
      total: existingCategory.total + item.monthlyEquivalent,
      count: existingCategory.count + 1,
    });
  }

  const overlapGroups = Array.from(overlaps.entries()).filter(
    ([, value]) => value.count > 1,
  );
  const totalMonthlySpend = reviews.reduce(
    (sum, item) => sum + item.monthlyEquivalent,
    0,
  );

  const highestCost = [...reviews].sort(
    (a, b) => b.monthlyEquivalent - a.monthlyEquivalent,
  )[0];

  const topCategoryEntry = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1].total - a[1].total,
  )[0];

  return {
    possibleSavingsMonthly: cancelCandidates.reduce(
      (sum, item) => sum + item.monthlyEquivalent,
      0,
    ),
    possibleSavingsYearly: cancelCandidates.reduce(
      (sum, item) => sum + item.yearlyEquivalent,
      0,
    ),
    cancelCandidatesCount: cancelCandidates.length,
    reviewCandidatesCount: reviewCandidates.length,
    overlapGroupsCount: overlapGroups.length,
    overlapSubscriptionsCount: overlapGroups.reduce(
      (sum, [, value]) => sum + value.count,
      0,
    ),
    overlapMonthlyExposure: overlapGroups.reduce(
      (sum, [, value]) => sum + value.monthlyExposure,
      0,
    ),
    highestCostSubscription: highestCost?.subscription ?? null,
    highestCostMonthlyEquivalent: highestCost?.monthlyEquivalent ?? 0,
    next7DaysCount: upcoming7.length,
    next7DaysTotal: upcoming7.reduce((sum, item) => sum + item.price, 0),
    next30DaysCount: upcoming30.length,
    next30DaysTotal: upcoming30.reduce((sum, item) => sum + item.price, 0),
    topCategory: topCategoryEntry
      ? {
          name: topCategoryEntry[0],
          total: topCategoryEntry[1].total,
          count: topCategoryEntry[1].count,
          share:
            totalMonthlySpend > 0
              ? topCategoryEntry[1].total / totalMonthlySpend
              : 0,
        }
      : null,
  };
}
