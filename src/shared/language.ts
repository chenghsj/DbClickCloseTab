export const LANGUAGES = ["auto", "en", "zh_TW", "zh_CN", "ja", "ko"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "auto";

export function normalizeLanguage(value: unknown): Language {
  return LANGUAGES.includes(value as Language) ? value as Language : DEFAULT_LANGUAGE;
}
