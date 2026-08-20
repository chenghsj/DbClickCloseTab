import { beforeEach, describe, expect, it, vi } from "vitest";

import { createExtensionSettings } from "../src/shared/extension-settings";
import { InMemorySettingsStorage } from "../src/shared/in-memory-settings-storage";

describe("background action icon", () => {
  beforeEach(() => vi.resetModules());

  it("uses the disabled icon and updates it when the setting changes", async () => {
    const storage = new InMemorySettingsStorage({ disabled: true });
    const settings = createExtensionSettings(storage);
    await settings.whenReady();
    vi.doMock("../src/shared/runtime-extension-settings", () => ({
      getRuntimeExtensionSettings: () => settings,
    }));
    const setIcon = vi.fn(
      (_details: { path: string }, callback: () => void) => callback(),
    );
    globalThis.chrome = {
      action: { setIcon },
      runtime: {
        lastError: undefined,
        onMessage: { addListener: vi.fn() },
      },
      scripting: { executeScript: vi.fn() },
      tabs: {
        onUpdated: { addListener: vi.fn() },
        remove: vi.fn(),
      },
    } as unknown as typeof chrome;

    await import("../src/background/index");
    await Promise.resolve();
    expect(setIcon).toHaveBeenLastCalledWith(
      { path: "icon-disable.png" },
      expect.any(Function),
    );

    storage.emitExternalChange({ disabled: false });
    expect(setIcon).toHaveBeenLastCalledWith(
      { path: "icon.png" },
      expect.any(Function),
    );
  });

  it("uses the disabled icon when the enabled setting cannot be loaded", async () => {
    const storage = new InMemorySettingsStorage({ disabled: false });
    storage.failNextRead(new Error("unavailable"));
    const settings = createExtensionSettings(storage);
    await settings.whenReady();
    vi.doMock("../src/shared/runtime-extension-settings", () => ({
      getRuntimeExtensionSettings: () => settings,
    }));
    const setIcon = vi.fn(
      (_details: { path: string }, callback: () => void) => callback(),
    );
    globalThis.chrome = {
      action: { setIcon },
      runtime: {
        lastError: undefined,
        onMessage: { addListener: vi.fn() },
      },
      scripting: { executeScript: vi.fn() },
      tabs: {
        onUpdated: { addListener: vi.fn() },
        remove: vi.fn(),
      },
    } as unknown as typeof chrome;

    await import("../src/background/index");
    await Promise.resolve();

    expect(setIcon).toHaveBeenLastCalledWith(
      { path: "icon-disable.png" },
      expect.any(Function),
    );

    storage.emitExternalChange({ theme: "dark" });
    expect(setIcon).toHaveBeenLastCalledWith(
      { path: "icon-disable.png" },
      expect.any(Function),
    );

    storage.emitExternalChange({ disabled: false });
    expect(setIcon).toHaveBeenLastCalledWith(
      { path: "icon.png" },
      expect.any(Function),
    );
  });
});
