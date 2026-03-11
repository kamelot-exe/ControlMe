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
  FR: "French",
  RU: "Russian",
  UK: "Ukrainian",
  GE: "German",
  ES: "Spanish",
  PT: "Portuguese",
  IT: "Italian",
  PL: "Polish",
  TR: "Turkish",
  UZ: "Uzbek",
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
