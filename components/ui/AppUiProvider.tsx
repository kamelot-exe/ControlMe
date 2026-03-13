"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LANGUAGES, type AppLanguage, getLanguageLabel } from "@/lib/i18n";

type ToastTone = "success" | "error" | "info";
type UsageFlagState = "used" | "unused";

export interface FeatureModules {
  renewalCalendar: boolean;
  costPerDay: boolean;
  usageFlags: boolean;
  pauseTracking: boolean;
  subscriptionTags: boolean;
}

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AppUiContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  languages: readonly AppLanguage[];
  getLanguageLabel: (language: AppLanguage) => string;
  showToast: (message: string, tone?: ToastTone, durationMs?: number) => void;
  modules: FeatureModules;
  setModuleEnabled: (module: keyof FeatureModules, enabled: boolean) => void;
  usageFlags: Record<string, UsageFlagState | undefined>;
  setUsageFlag: (subscriptionId: string, value: UsageFlagState | null) => void;
  pausedSubscriptions: Record<string, boolean | undefined>;
  setPausedSubscription: (subscriptionId: string, paused: boolean) => void;
  subscriptionTags: Record<string, string[] | undefined>;
  setSubscriptionTags: (subscriptionId: string, tags: string[]) => void;
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

const DEFAULT_MODULES: FeatureModules = {
  renewalCalendar: false,
  costPerDay: false,
  usageFlags: false,
  pauseTracking: false,
  subscriptionTags: false,
};

const LANGUAGE_KEY = "controlme.language";
const MODULES_KEY = "controlme.modules";
const USAGE_FLAGS_KEY = "controlme.usage-flags";
const PAUSED_KEY = "controlme.paused-subscriptions";
const TAGS_KEY = "controlme.subscription-tags";

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function AppUiProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("EN");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [modules, setModules] = useState<FeatureModules>(DEFAULT_MODULES);
  const [usageFlags, setUsageFlags] = useState<
    Record<string, UsageFlagState | undefined>
  >({});
  const [pausedSubscriptions, setPausedSubscriptions] = useState<
    Record<string, boolean | undefined>
  >({});
  const [subscriptionTags, setSubscriptionTagsState] = useState<
    Record<string, string[] | undefined>
  >({});

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY) as AppLanguage | null;
    if (storedLanguage && LANGUAGES.includes(storedLanguage)) {
      setLanguageState(storedLanguage);
      document.documentElement.lang = storedLanguage.toLowerCase();
    }

    setModules(parseJson(window.localStorage.getItem(MODULES_KEY), DEFAULT_MODULES));
    setUsageFlags(parseJson(window.localStorage.getItem(USAGE_FLAGS_KEY), {}));
    setPausedSubscriptions(parseJson(window.localStorage.getItem(PAUSED_KEY), {}));
    setSubscriptionTagsState(parseJson(window.localStorage.getItem(TAGS_KEY), {}));
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage.toLowerCase();
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success", durationMs = 2000) => {
      const id = Date.now();
      setToast({ id, message, tone });
      window.setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, durationMs);
    },
    [],
  );

  const setModuleEnabled = useCallback(
    (module: keyof FeatureModules, enabled: boolean) => {
      setModules((current) => {
        const next = { ...current, [module]: enabled };
        window.localStorage.setItem(MODULES_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const setUsageFlag = useCallback((subscriptionId: string, value: UsageFlagState | null) => {
    setUsageFlags((current) => {
      const next = { ...current };

      if (value === null) {
        delete next[subscriptionId];
      } else {
        next[subscriptionId] = value;
      }

      window.localStorage.setItem(USAGE_FLAGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setPausedSubscription = useCallback((subscriptionId: string, paused: boolean) => {
    setPausedSubscriptions((current) => {
      const next = { ...current, [subscriptionId]: paused };
      if (!paused) {
        delete next[subscriptionId];
      }
      window.localStorage.setItem(PAUSED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setSubscriptionTags = useCallback((subscriptionId: string, tags: string[]) => {
    setSubscriptionTagsState((current) => {
      const sanitized = tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 6);
      const next = { ...current, [subscriptionId]: sanitized };
      if (sanitized.length === 0) {
        delete next[subscriptionId];
      }
      window.localStorage.setItem(TAGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AppUiContextValue>(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      getLanguageLabel,
      showToast,
      modules,
      setModuleEnabled,
      usageFlags,
      setUsageFlag,
      pausedSubscriptions,
      setPausedSubscription,
      subscriptionTags,
      setSubscriptionTags,
    }),
    [
      language,
      setLanguage,
      showToast,
      modules,
      setModuleEnabled,
      usageFlags,
      setUsageFlag,
      pausedSubscriptions,
      setPausedSubscription,
      subscriptionTags,
      setSubscriptionTags,
    ],
  );

  return (
    <AppUiContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] max-w-sm animate-slide-up">
          <div
            className="rounded-2xl border px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            style={{
              background:
                toast.tone === "success"
                  ? "linear-gradient(180deg, rgba(74,222,128,0.16), rgba(6,11,22,0.96))"
                  : toast.tone === "error"
                    ? "linear-gradient(180deg, rgba(248,113,113,0.16), rgba(6,11,22,0.96))"
                    : "linear-gradient(180deg, rgba(255,115,85,0.16), rgba(6,11,22,0.96))",
              borderColor:
                toast.tone === "success"
                  ? "rgba(74,222,128,0.28)"
                  : toast.tone === "error"
                    ? "rgba(248,113,113,0.28)"
                    : "rgba(255,115,85,0.28)",
            }}
          >
            <p className="text-sm font-medium text-[#F9FAFB]">{toast.message}</p>
          </div>
        </div>
      ) : null}
    </AppUiContext.Provider>
  );
}

export function useAppUi() {
  const context = useContext(AppUiContext);
  if (!context) {
    throw new Error("useAppUi must be used inside AppUiProvider");
  }
  return context;
}
