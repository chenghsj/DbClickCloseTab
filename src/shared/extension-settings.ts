import { DEFAULT_DISABLED, normalizeDisabled } from "@/shared/disabled";
import {
  DEFAULT_INTERVAL,
  normalizeInterval,
  parseInterval,
  parseStoredInterval,
} from "@/shared/interval";
import {
  DEFAULT_THEME,
  normalizeTheme,
  THEMES,
  type Theme,
} from "@/shared/theme";

export interface ExtensionSettings {
  disabled: boolean;
  theme: Theme;
  timeInterval: number;
}

export type ExtensionSettingsChange = Partial<ExtensionSettings>;
export type ExtensionSettingsStatus = "loading" | "ready" | "error";
export type SettingKey = keyof ExtensionSettings;

export interface ExtensionSettingsSnapshot {
  confirmed: Readonly<Record<SettingKey, boolean>>;
  settings: ExtensionSettings;
  status: ExtensionSettingsStatus;
}

export type StoredSettings = Partial<Record<SettingKey, unknown>>;

export interface SettingsStorageAdapter {
  read(): Promise<StoredSettings>;
  subscribe(listener: (change: StoredSettings) => void): () => void;
  write(change: ExtensionSettingsChange): Promise<void>;
}

export interface ExtensionSettingsModule {
  getSnapshot(): ExtensionSettingsSnapshot;
  subscribe(listener: () => void): () => void;
  update(change: ExtensionSettingsChange): Promise<void>;
  whenReady(): Promise<ExtensionSettingsSnapshot>;
}

export const DEFAULT_EXTENSION_SETTINGS: ExtensionSettings = Object.freeze({
  disabled: DEFAULT_DISABLED,
  theme: DEFAULT_THEME,
  timeInterval: DEFAULT_INTERVAL,
});

export const EXTENSION_SETTING_KEYS = [
  "disabled",
  "theme",
  "timeInterval",
] as const satisfies readonly SettingKey[];

function isValidStoredValue(key: SettingKey, value: unknown): boolean {
  if (value === undefined) return true;
  if (key === "disabled") return typeof value === "boolean";
  if (key === "theme") return THEMES.includes(value as Theme);
  return parseStoredInterval(value) !== null;
}

function normalizeStoredSettings(values: StoredSettings): ExtensionSettings {
  return {
    disabled: normalizeDisabled(values.disabled),
    theme: normalizeTheme(values.theme),
    timeInterval: normalizeInterval(values.timeInterval),
  };
}

function validateChange(change: ExtensionSettingsChange): void {
  if (change.disabled !== undefined && typeof change.disabled !== "boolean") {
    throw new TypeError("Invalid disabled setting.");
  }
  if (change.theme !== undefined && !THEMES.includes(change.theme)) {
    throw new TypeError("Invalid theme setting.");
  }
  if (
    change.timeInterval !== undefined &&
    (typeof change.timeInterval !== "number" ||
      parseInterval(change.timeInterval) === null)
  ) {
    throw new TypeError("Invalid timeInterval setting.");
  }
}

function snapshotsEqual(
  left: ExtensionSettingsSnapshot,
  right: ExtensionSettingsSnapshot,
): boolean {
  return (
    left.status === right.status &&
    left.confirmed.disabled === right.confirmed.disabled &&
    left.confirmed.theme === right.confirmed.theme &&
    left.confirmed.timeInterval === right.confirmed.timeInterval &&
    left.settings.disabled === right.settings.disabled &&
    left.settings.theme === right.settings.theme &&
    left.settings.timeInterval === right.settings.timeInterval
  );
}

export function createExtensionSettings(
  storage: SettingsStorageAdapter,
): ExtensionSettingsModule {
  let snapshot: ExtensionSettingsSnapshot = {
    confirmed: { disabled: false, theme: false, timeInterval: false },
    settings: DEFAULT_EXTENSION_SETTINGS,
    status: "loading",
  };
  let initialReadSettled = false;
  const changedDuringInitialRead = new Set<SettingKey>();
  const validChangesDuringInitialRead = new Set<SettingKey>();
  const listeners = new Set<() => void>();
  const writeTails = new Map<SettingKey, Promise<void>>();

  function publish(nextSnapshot: ExtensionSettingsSnapshot): void {
    if (snapshotsEqual(snapshot, nextSnapshot)) return;
    snapshot = nextSnapshot;
    for (const listener of listeners) listener();
  }

  storage.subscribe((change) => {
    const changedKeys = EXTENSION_SETTING_KEYS.filter((key) => key in change);
    if (changedKeys.length === 0) return;
    const validChangedKeys = changedKeys.filter((key) =>
      isValidStoredValue(key, change[key]),
    );
    const validChangedKeySet = new Set(validChangedKeys);
    if (!initialReadSettled) {
      for (const key of changedKeys) {
        changedDuringInitialRead.add(key);
        if (validChangedKeySet.has(key)) {
          validChangesDuringInitialRead.add(key);
        } else {
          validChangesDuringInitialRead.delete(key);
        }
      }
    }

    const normalizedChange = normalizeStoredSettings(change);
    const nextConfirmed = { ...snapshot.confirmed };
    const nextSettings = { ...snapshot.settings };
    for (const key of changedKeys) {
      nextConfirmed[key] = validChangedKeySet.has(key);
      Object.assign(nextSettings, { [key]: normalizedChange[key] });
    }
    publish({
      confirmed: nextConfirmed,
      settings: nextSettings,
      status: initialReadSettled
        ? snapshot.status === "error" && validChangedKeys.length === 0
          ? "error"
          : "ready"
        : "loading",
    });
  });

  void storage
    .read()
    .then((storedSettings) => {
      const normalized = normalizeStoredSettings(storedSettings);
      const nextConfirmed = { ...snapshot.confirmed };
      const nextSettings = { ...snapshot.settings };
      for (const key of EXTENSION_SETTING_KEYS) {
        if (!changedDuringInitialRead.has(key)) {
          nextConfirmed[key] = isValidStoredValue(key, storedSettings[key]);
          Object.assign(nextSettings, { [key]: normalized[key] });
        }
      }
      initialReadSettled = true;
      publish({ confirmed: nextConfirmed, settings: nextSettings, status: "ready" });
    })
    .catch(() => {
      initialReadSettled = true;
      publish({
        confirmed: snapshot.confirmed,
        settings: snapshot.settings,
        status: validChangesDuringInitialRead.size > 0 ? "ready" : "error",
      });
    });

  function enqueueChange(
    change: ExtensionSettingsChange,
    changedKeys: SettingKey[],
  ): Promise<void> {
    const previousWrites = [
      ...new Set(
        changedKeys
          .map((key) => writeTails.get(key))
          .filter((write): write is Promise<void> => write !== undefined),
      ),
    ];
    const write = Promise.all(previousWrites).then(async () => {
      const changedWhileWriting = new Set<SettingKey>();
      const stopWatching = storage.subscribe((storedChange) => {
        for (const key of changedKeys) {
          if (key in storedChange) changedWhileWriting.add(key);
        }
      });
      try {
        await storage.write(change);
      } finally {
        stopWatching();
      }

      const readback = changedWhileWriting.size
        ? await storage.read().catch(() => null)
        : null;
      const confirmedValues = readback ?? change;
      const normalizedValues = normalizeStoredSettings(confirmedValues);

      const nextConfirmed = { ...snapshot.confirmed };
      const nextSettings = { ...snapshot.settings };
      let shouldPublish = false;
      for (const key of changedKeys) {
        if (readback === null && changedWhileWriting.has(key)) continue;
        const confirmed = isValidStoredValue(key, confirmedValues[key]);
        nextConfirmed[key] = confirmed;
        Object.assign(nextSettings, { [key]: normalizedValues[key] });
        shouldPublish = true;
        if (!initialReadSettled) {
          changedDuringInitialRead.add(key);
          if (confirmed) validChangesDuringInitialRead.add(key);
        }
      }
      if (shouldPublish) {
        publish({
          confirmed: nextConfirmed,
          settings: nextSettings,
          status: initialReadSettled ? "ready" : "loading",
        });
      }
    });
    const tail = write.catch(() => undefined).finally(() => {
      for (const key of changedKeys) {
        if (writeTails.get(key) === tail) writeTails.delete(key);
      }
    });
    for (const key of changedKeys) writeTails.set(key, tail);
    return write;
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    getSnapshot: () => snapshot,
    subscribe,
    async update(change) {
      validateChange(change);
      const changedKeys = EXTENSION_SETTING_KEYS.filter(
        (key) => change[key] !== undefined,
      );
      if (changedKeys.length === 0) return;
      await enqueueChange(change, changedKeys);
    },
    whenReady() {
      if (snapshot.status !== "loading") return Promise.resolve(snapshot);
      return new Promise((resolve) => {
        const unsubscribe = subscribe(() => {
          if (snapshot.status === "loading") return;
          unsubscribe();
          resolve(snapshot);
        });
      });
    },
  };
}
