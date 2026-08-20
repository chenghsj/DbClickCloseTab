import {
  EXTENSION_SETTING_KEYS,
  type ExtensionSettingsChange,
  type SettingsStorageAdapter,
  type StoredSettings,
} from "@/shared/extension-settings";

function chromeError(extensionApi: typeof chrome): Error | null {
  const error = extensionApi.runtime.lastError;
  return error ? new Error(error.message) : null;
}

export function createChromeSettingsStorage(
  providedApi?: typeof chrome,
): SettingsStorageAdapter {
  const extensionApi =
    providedApi ?? (typeof chrome === "undefined" ? undefined : chrome);
  if (!extensionApi?.storage?.sync || !extensionApi.storage.onChanged) {
    throw new Error("Chrome extension storage is unavailable.");
  }

  return {
    read() {
      return new Promise<StoredSettings>((resolve, reject) => {
        extensionApi.storage.sync.get([...EXTENSION_SETTING_KEYS], (items) => {
          const error = chromeError(extensionApi);
          if (error) {
            reject(error);
            return;
          }
          resolve(items as StoredSettings);
        });
      });
    },
    subscribe(listener) {
      const storageListener = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: chrome.storage.AreaName,
      ) => {
        if (areaName !== "sync") return;
        const change: StoredSettings = {};
        for (const key of EXTENSION_SETTING_KEYS) {
          if (changes[key]) change[key] = changes[key].newValue;
        }
        if (Object.keys(change).length > 0) listener(change);
      };
      extensionApi.storage.onChanged.addListener(storageListener);
      return () => extensionApi.storage.onChanged.removeListener(storageListener);
    },
    write(change: ExtensionSettingsChange) {
      return new Promise<void>((resolve, reject) => {
        extensionApi.storage.sync.set(change, () => {
          const error = chromeError(extensionApi);
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
  };
}
