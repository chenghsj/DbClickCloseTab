import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { ExtensionSettingsModule } from "@/shared/extension-settings";
import { parseInterval, parseStoredInterval } from "@/shared/interval";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";
import type { IntervalSaveState } from "@/shared/settings-state";

interface AutoSaveIntervalOptions {
  settings?: ExtensionSettingsModule;
}

export function useAutoSaveInterval({
  settings: providedSettings,
}: AutoSaveIntervalOptions = {}) {
  const settings = providedSettings ?? getRuntimeExtensionSettings();
  const snapshot = useSyncExternalStore(
    settings.subscribe,
    settings.getSnapshot,
  );
  const [draft, setDraftState] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<IntervalSaveState>("loading");
  const [writeInFlight, setWriteInFlight] = useState(false);
  const active = useRef(true);
  const draftRef = useRef("");
  const localDirty = useRef(false);
  const lastSavedValue = useRef<number | null>(null);
  const inFlightValue = useRef<number | null>(null);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    if (snapshot.status === "loading") return;
    const interval = snapshot.settings.timeInterval;
    setLoaded(true);
    if (snapshot.status === "error" || !snapshot.confirmed.timeInterval) {
      lastSavedValue.current = null;
      if (localDirty.current || inFlightValue.current !== null) return;
      if (parseStoredInterval(draftRef.current) !== interval) {
        draftRef.current = String(interval);
        setDraftState(String(interval));
      }
      setSaveState("load-error");
      return;
    }

    lastSavedValue.current = interval;
    if (inFlightValue.current === interval) return;
    if (localDirty.current || inFlightValue.current !== null) return;
    if (parseStoredInterval(draftRef.current) === interval) {
      setSaveState("saved");
      return;
    }

    draftRef.current = String(interval);
    setDraftState(String(interval));
    setSaveState("saved");
  }, [snapshot]);

  function persistInterval(interval: number): void {
    if (inFlightValue.current !== null) return;

    inFlightValue.current = interval;
    if (active.current) setWriteInFlight(true);
    settings
      .update({ timeInterval: interval })
      .then(() => {
        inFlightValue.current = null;
        if (!active.current) return;
        setWriteInFlight(false);

        const savedSnapshot = settings.getSnapshot();
        if (!savedSnapshot.confirmed.timeInterval) {
          setSaveState("load-error");
          return;
        }
        const savedInterval = savedSnapshot.settings.timeInterval;
        if (savedInterval !== interval) {
          lastSavedValue.current = savedInterval;
          localDirty.current = false;
          draftRef.current = String(savedInterval);
          setDraftState(String(savedInterval));
          setSaveState("saved");
          return;
        }

        localDirty.current = false;
        setSaveState("saved");
      })
      .catch(() => {
        inFlightValue.current = null;
        if (interval === lastSavedValue.current) {
          if (active.current) {
            setWriteInFlight(false);
            localDirty.current = false;
            setSaveState("saved");
          }
          return;
        }

        if (active.current) {
          setWriteInFlight(false);
          setSaveState("save-error");
        }
      });
  }

  useEffect(() => {
    const persistPendingInterval = () => {
      const interval = parseInterval(draftRef.current);
      if (
        !localDirty.current ||
        interval === null ||
        inFlightValue.current !== null
      ) {
        return;
      }
      persistInterval(interval);
    };

    window.addEventListener("pagehide", persistPendingInterval);
    return () => window.removeEventListener("pagehide", persistPendingInterval);
  }, []);

  function setDraft(value: string): void {
    if (inFlightValue.current !== null) return;
    draftRef.current = value;
    localDirty.current = true;
    setDraftState(value);

    const interval = parseInterval(value);
    if (interval === null) {
      setSaveState("invalid");
      return;
    }
    if (interval === lastSavedValue.current) {
      localDirty.current = false;
      setSaveState("saved");
      return;
    }
    setSaveState("saving");
  }

  function commitDraft(value = draftRef.current): void {
    if (inFlightValue.current !== null) return;
    const interval = parseInterval(value);
    if (interval === null) {
      setSaveState("invalid");
      return;
    }
    if (interval === lastSavedValue.current) {
      localDirty.current = false;
      setSaveState("saved");
      return;
    }

    draftRef.current = value;
    localDirty.current = true;
    setSaveState("saving");
    persistInterval(interval);
  }

  return {
    commitDraft,
    draft,
    loaded,
    saveState,
    setDraft,
    writeInFlight,
  };
}
