import type { FeatureModules } from "@/components/ui/AppUiProvider";
import type { Subscription } from "@/shared/types";

export function applyPausedState(
  subscriptions: Subscription[],
  modules: FeatureModules,
  pausedSubscriptions: Record<string, boolean | undefined>,
) {
  if (!modules.pauseTracking) {
    return subscriptions;
  }

  return subscriptions.map((subscription) =>
    pausedSubscriptions[subscription.id]
      ? { ...subscription, isActive: false }
      : subscription,
  );
}

export function getUsageLabel(
  modules: FeatureModules,
  usageFlags: Record<string, "used" | "unused" | undefined>,
  subscriptionId: string,
) {
  if (!modules.usageFlags) return null;
  return usageFlags[subscriptionId] ?? null;
}

export function getSubscriptionTags(
  modules: FeatureModules,
  tagMap: Record<string, string[] | undefined>,
  subscriptionId: string,
) {
  if (!modules.subscriptionTags) return [];
  return tagMap[subscriptionId] ?? [];
}
