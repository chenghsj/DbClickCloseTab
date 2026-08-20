import { describe, expect, it, vi } from "vitest";

import { createChromeSettingsStorage } from "@/shared/chrome-settings-storage";
import { EXTENSION_SETTING_KEYS } from "@/shared/extension-settings";

describe("Chrome settings storage adapter", () => {
  it("translates reads, partial writes, changes, and Chrome errors", async () => {
    const listeners: Array<(
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => void> = [];
    const runtime = { lastError: undefined as { message: string } | undefined };
    const chromeApi = {
      runtime,
      storage: {
        sync: {
          get: vi.fn((_keys: string[], callback: (items: object) => void) =>
            callback({ disabled: true, timeInterval: 500 }),
          ),
          set: vi.fn((_change: object, callback: () => void) => callback()),
        },
        onChanged: {
          addListener: vi.fn((listener: (typeof listeners)[number]) => listeners.push(listener)),
          removeListener: vi.fn(),
        },
      },
    } as unknown as typeof chrome;
    const storage = createChromeSettingsStorage(chromeApi);

    await expect(storage.read()).resolves.toEqual({ disabled: true, timeInterval: 500 });
    expect(chromeApi.storage.sync.get).toHaveBeenCalledWith(
      [...EXTENSION_SETTING_KEYS],
      expect.any(Function),
    );
    await expect(storage.write({ theme: "dark" })).resolves.toBeUndefined();

    const listener = vi.fn();
    storage.subscribe(listener);
    listeners[0]({ theme: { newValue: "dark" } }, "sync");
    listeners[0]({ theme: { newValue: "light" } }, "local");
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ theme: "dark" });

    runtime.lastError = { message: "unavailable" };
    await expect(storage.read()).rejects.toThrow("unavailable");
  });
});
