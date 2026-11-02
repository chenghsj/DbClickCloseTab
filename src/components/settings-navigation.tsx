import { Languages, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { useLanguageSetting } from "@/options/use-language-setting";
import type { useThemeSetting } from "@/options/use-theme-setting";
import { t } from "@/shared/i18n";
import { LANGUAGES, normalizeLanguage, type Language } from "@/shared/language";

interface SettingsNavigationProps {
  themeSetting: ReturnType<typeof useThemeSetting>;
  languageSetting: ReturnType<typeof useLanguageSetting>;
}

const languageLabels: Record<Exclude<Language, "auto">, string> = {
  en: "English", zh_TW: "繁體中文", zh_CN: "简体中文", ja: "日本語", ko: "한국어",
};

export function SettingsNavigation({ themeSetting, languageSetting }: SettingsNavigationProps) {
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  useEffect(() => {
    // Select restores focus after closing, including after pointer selection.
    // Track input modality so that restoration only shows a ring for keyboard use.
    const handleKeyDown = () => setKeyboardFocus(true);
    const handlePointerDown = () => setKeyboardFocus(false);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);
  const nextTheme = themeSetting.resolvedTheme === "dark" ? "light" : "dark";
  const ThemeIcon = nextTheme === "dark" ? Moon : Sun;
  const themeAction = t(nextTheme === "dark" ? "switchToDark" : "switchToLight");
  const languageLabel = languageSetting.language === "auto" ? t("languageAuto") : languageLabels[languageSetting.language];
  return (
    <nav aria-label={t("appearanceAndLanguage")} className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        data-keyboard-focus={keyboardFocus}
        disabled={!themeSetting.loaded || themeSetting.saveState === "saving"}
        aria-label={themeAction}
        title={themeAction}
        onClick={() => themeSetting.setTheme(nextTheme)}
      >
        <ThemeIcon aria-hidden="true" />
      </Button>
      <Select value={languageSetting.language} disabled={!languageSetting.loaded || languageSetting.saveState === "saving"} onValueChange={value => languageSetting.setLanguage(normalizeLanguage(value))}>
        <SelectTrigger iconOnly data-keyboard-focus={keyboardFocus} aria-label={t("languageLabel")} title={`${t("languageLabel")}: ${languageLabel}`}>
          <Languages aria-hidden="true" />
          <span className="sr-only"><SelectValue>{languageLabel}</SelectValue></span>
        </SelectTrigger>
        <SelectContent align="end" className="w-48">
          <SelectGroup>
            {LANGUAGES.map(language => <SelectItem key={language} value={language}>{language === "auto" ? t("languageAuto") : languageLabels[language]}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </nav>
  );
}

export function SettingsNavigationErrors({ themeSetting, languageSetting }: SettingsNavigationProps) {
  return <>
    {themeSetting.saveState === "error" ? <p role="alert" className="text-xs font-medium text-destructive">{t("themeError")}</p> : null}
    {languageSetting.saveState === "error" ? <p role="alert" className="text-xs font-medium text-destructive">{t("languageError")}</p> : null}
  </>;
}
