export const LANGUAGES = [
  "EN",
  "FR",
  "RU",
  "UK",
  "GE",
  "ES",
  "PT",
  "IT",
  "PL",
  "TR",
  "UZ",
] as const;

export type AppLanguage = (typeof LANGUAGES)[number];

const languageLabels: Record<AppLanguage, string> = {
  EN: "English",
  FR: "Français",
  RU: "Русский",
  UK: "Українська",
  GE: "Deutsch",
  ES: "Español",
  PT: "Português",
  IT: "Italiano",
  PL: "Polski",
  TR: "Türkçe",
  UZ: "O'zbekcha",
};

export function getLanguageLabel(language: AppLanguage) {
  return languageLabels[language];
}

export function translate(
  language: AppLanguage,
  values: Partial<Record<AppLanguage, string>>,
  fallback: string,
) {
  return values[language] ?? fallback;
}
