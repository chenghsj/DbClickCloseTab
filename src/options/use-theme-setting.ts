import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { ExtensionSettingsModule } from "@/shared/extension-settings";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";
import type { ExtensionSaveState } from "@/shared/settings-state";
import {
  applyTheme,
  normalizeTheme,
  type Theme,
} from "@/shared/theme";

export function useThemeSetting(providedSettings?: ExtensionSettingsModule) {
  const settings = providedSettings ?? getRuntimeExtensionSettings();
  const snapshot = useSyncExternalStore(
    settings.subscribe,
    settings.getSnapshot,
  );
  const initialTheme = normalizeTheme(document.documentElement.dataset.theme);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<ExtensionSaveState>("loading");
  const savedValue = useRef(initialTheme);
  const themeRef = useRef(initialTheme);

  useEffect(() => {
    const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => applyTheme(themeRef.current);
    colorScheme?.addEventListener("change", handleColorSchemeChange);

    return () => {
      colorScheme?.removeEventListener("change", handleColorSchemeChange);
    };
  }, []);

  useEffect(() => {
    if (snapshot.status === "loading") return;
    setLoaded(true);
    if (snapshot.status === "error" || !snapshot.confirmed.theme) {
      setSaveState("error");
      return;
    }
    const value = snapshot.settings.theme;
    savedValue.current = value;
    themeRef.current = value;
    setThemeState(value);
    applyTheme(value);
    setSaveState("idle");
  }, [snapshot]);

  function setTheme(value: Theme) {
    themeRef.current = value;
    setThemeState(value);
    applyTheme(value);
    setSaveState("saving");

    settings
      .update({ theme: value })
      .then(() => {
        if (settings.getSnapshot().confirmed.theme) setSaveState("idle");
      })
      .catch(() => {
        themeRef.current = savedValue.current;
        setThemeState(savedValue.current);
        applyTheme(savedValue.current);
        setSaveState("error");
      });
  }

  return { loaded, saveState, setTheme, theme };
}
