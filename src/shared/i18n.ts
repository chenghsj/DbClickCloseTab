import english from "../../_locales/en/messages.json";
import japanese from "../../_locales/ja/messages.json";
import korean from "../../_locales/ko/messages.json";
import simplifiedChinese from "../../_locales/zh_CN/messages.json";
import traditionalChinese from "../../_locales/zh_TW/messages.json";
import type { Language } from "@/shared/language";

export type MessageKey = keyof typeof english;

interface MessageDefinition {
  message: string;
  placeholders?: Record<string, { content: string }>;
}

const catalogs = {
  en: english,
  ja: japanese,
  ko: korean,
  zh_CN: simplifiedChinese,
  zh_TW: traditionalChinese,
};
let selectedLanguage: Language = "auto";

export function t(key: MessageKey, substitutions: string[] = []): string {
  const localized =
    selectedLanguage === "auto" && typeof chrome !== "undefined"
      ? chrome.i18n?.getMessage(key, substitutions)
      : undefined;
  if (localized) return localized;

  // Keep previews and missing-message fallbacks readable without extension APIs.
  const definition: MessageDefinition = selectedLanguage === "auto"
    ? english[key] : catalogs[selectedLanguage][key];
  return definition.message.replace(/\$(\w+)\$/g, (token, name: string) => {
    const content = definition.placeholders?.[name.toLowerCase()]?.content;
    return content?.replace(/\$(\d)/g, (_, index: string) =>
      substitutions[Number(index) - 1] ?? "",
    ) ?? token;
  });
}

export function applyLanguage(language: Language, page: "popup" | "options"): void {
  selectedLanguage = language;
  localizeDocument(page);
}

export function localizeDocument(page: "popup" | "options"): void {
  document.documentElement.lang = t("language");
  document.title = t(page === "options" ? "optionsTitle" : "extensionName");
}
