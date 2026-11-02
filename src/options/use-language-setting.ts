import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { ExtensionSettingsModule } from "@/shared/extension-settings";
import { applyLanguage } from "@/shared/i18n";
import { DEFAULT_LANGUAGE, type Language } from "@/shared/language";
import type { ExtensionSaveState } from "@/shared/settings-state";

export function useLanguageSetting(settings: ExtensionSettingsModule, page: "popup" | "options") {
  const snapshot = useSyncExternalStore(settings.subscribe, settings.getSnapshot);
  const status = snapshot.status;
  const languageConfirmed = snapshot.confirmed.language;
  const storedLanguage = snapshot.settings.language;
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<ExtensionSaveState>("loading");
  const savedValue = useRef<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (status === "loading") return;
    setLoaded(true);
    if (status === "error" || !languageConfirmed) {
      setSaveState("error");
      return;
    }
    savedValue.current = storedLanguage;
    applyLanguage(storedLanguage, page);
    setLanguageState(storedLanguage);
    setSaveState("idle");
  }, [status, languageConfirmed, storedLanguage, page]);

  function setLanguage(value: Language) {
    applyLanguage(value, page);
    setLanguageState(value);
    setSaveState("saving");
    settings.update({ language: value }).then(() => {
      if (settings.getSnapshot().confirmed.language) setSaveState("idle");
    }).catch(() => {
      applyLanguage(savedValue.current, page);
      setLanguageState(savedValue.current);
      setSaveState("error");
    });
  }

  return { language, loaded, saveState, setLanguage };
}
