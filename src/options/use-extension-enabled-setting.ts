import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { DEFAULT_DISABLED } from "@/shared/disabled";
import type { ExtensionSettingsModule } from "@/shared/extension-settings";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";
import type { ExtensionSaveState } from "@/shared/settings-state";

export function useExtensionEnabledSetting(
  providedSettings?: ExtensionSettingsModule,
) {
  const settings = providedSettings ?? getRuntimeExtensionSettings();
  const snapshot = useSyncExternalStore(
    settings.subscribe,
    settings.getSnapshot,
  );
  const defaultEnabled = !DEFAULT_DISABLED;
  const [enabled, setEnabledState] = useState(defaultEnabled);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<ExtensionSaveState>("loading");
  const savedValue = useRef(defaultEnabled);

  useEffect(() => {
    if (snapshot.status === "loading") return;
    setLoaded(true);
    if (snapshot.status === "error" || !snapshot.confirmed.disabled) {
      savedValue.current = false;
      setEnabledState(false);
      setSaveState("error");
      return;
    }
    const nextEnabled = !snapshot.settings.disabled;
    savedValue.current = nextEnabled;
    setEnabledState(nextEnabled);
    setSaveState("idle");
  }, [snapshot]);

  function setEnabled(value: boolean) {
    setEnabledState(value);
    setSaveState("saving");

    settings
      .update({ disabled: !value })
      .then(() => {
        if (settings.getSnapshot().confirmed.disabled) setSaveState("idle");
      })
      .catch(() => {
        setEnabledState(savedValue.current);
        setSaveState("error");
      });
  }

  return { enabled, loaded, saveState, setEnabled };
}
