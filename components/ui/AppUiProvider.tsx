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
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("EN");
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("controlme.language") as AppLanguage | null;
    if (stored && LANGUAGES.includes(stored)) {
      setLanguageState(stored);
      document.documentElement.lang = stored.toLowerCase();
    }
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("controlme.language", nextLanguage);
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

  const value = useMemo<AppUiContextValue>(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      getLanguageLabel,
      showToast,
    }),
    [language, setLanguage, showToast],
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
