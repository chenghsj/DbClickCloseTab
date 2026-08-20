import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createExtensionSettings } from "../src/shared/extension-settings";
import { InMemorySettingsStorage } from "../src/shared/in-memory-settings-storage";

async function installSettings(initial: Record<string, unknown>) {
  const storage = new InMemorySettingsStorage(initial);
  const settings = createExtensionSettings(storage);
  await settings.whenReady();
  vi.doMock("../src/shared/runtime-extension-settings", () => ({
    getRuntimeExtensionSettings: () => settings,
  }));
  return { settings, storage };
}

describe("content script settings", () => {
  const auxClickListeners: EventListener[] = [];

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    const addEventListener = window.addEventListener.bind(window);
    vi.spyOn(window, "addEventListener").mockImplementation(
      (type, listener, options) => {
        if (type === "auxclick") auxClickListeners.push(listener as EventListener);
        addEventListener(type, listener, options);
      },
    );
  });

  afterEach(() => {
    for (const listener of auxClickListeners.splice(0)) {
      window.removeEventListener("auxclick", listener);
    }
    vi.restoreAllMocks();
  });

  it("stops closing tabs while disabled and resumes immediately when enabled", async () => {
    const { storage } = await installSettings({ disabled: true, timeInterval: 400 });
    const sendMessage = vi.fn();
    globalThis.chrome = {
      runtime: { lastError: undefined, sendMessage },
    } as unknown as typeof chrome;

    await import("../src/content/inject");
    await Promise.resolve();
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).not.toHaveBeenCalled();

    storage.emitExternalChange({ disabled: false });
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).toHaveBeenCalledOnce();
    expect(sendMessage).toHaveBeenCalledWith({ closeTab: true });
  });

  it("does not close tabs when the enabled setting cannot be loaded", async () => {
    const storage = new InMemorySettingsStorage({ disabled: true, timeInterval: 400 });
    storage.failNextRead(new Error("unavailable"));
    const settings = createExtensionSettings(storage);
    await settings.whenReady();
    vi.doMock("../src/shared/runtime-extension-settings", () => ({
      getRuntimeExtensionSettings: () => settings,
    }));
    const sendMessage = vi.fn();
    globalThis.chrome = {
      runtime: { lastError: undefined, sendMessage },
    } as unknown as typeof chrome;

    await import("../src/content/inject");
    await Promise.resolve();
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));

    expect(sendMessage).not.toHaveBeenCalled();

    storage.emitExternalChange({ theme: "dark" });
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).not.toHaveBeenCalled();

    storage.emitExternalChange({ disabled: false });
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).toHaveBeenCalledOnce();
  });

  it("stays paused when an unrelated setting changes before a failed read settles", async () => {
    const storage = new InMemorySettingsStorage({ disabled: true, timeInterval: 400 });
    storage.failNextRead(new Error("unavailable"));
    const settings = createExtensionSettings(storage);
    storage.emitExternalChange({ theme: "dark" });
    await settings.whenReady();
    vi.doMock("../src/shared/runtime-extension-settings", () => ({
      getRuntimeExtensionSettings: () => settings,
    }));
    const sendMessage = vi.fn();
    globalThis.chrome = {
      runtime: { lastError: undefined, sendMessage },
    } as unknown as typeof chrome;

    await import("../src/content/inject");
    await Promise.resolve();
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("preserves a fractional numeric-string interval written by released versions", async () => {
    await installSettings({ disabled: false, timeInterval: "650.5" });
    const sendMessage = vi.fn();
    globalThis.chrome = {
      runtime: { lastError: undefined, sendMessage },
    } as unknown as typeof chrome;

    await import("../src/content/inject");
    await Promise.resolve();
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    await vi.advanceTimersByTimeAsync(500);
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).toHaveBeenCalledOnce();
  });

  it("keeps the last confirmed interval after a malformed storage change", async () => {
    const { storage } = await installSettings({ disabled: false, timeInterval: 650 });
    const sendMessage = vi.fn();
    globalThis.chrome = {
      runtime: { lastError: undefined, sendMessage },
    } as unknown as typeof chrome;

    await import("../src/content/inject");
    await Promise.resolve();
    storage.emitExternalChange({ timeInterval: "bad" });
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    await vi.advanceTimersByTimeAsync(500);
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));

    expect(sendMessage).toHaveBeenCalledOnce();
  });

  it("resets an active gesture when the confirmed interval changes", async () => {
    const { storage } = await installSettings({ disabled: false, timeInterval: 400 });
    const sendMessage = vi.fn();
    globalThis.chrome = {
      runtime: { lastError: undefined, sendMessage },
    } as unknown as typeof chrome;

    await import("../src/content/inject");
    await Promise.resolve();
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    storage.emitExternalChange({ timeInterval: 700 });
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).not.toHaveBeenCalled();
    window.dispatchEvent(new MouseEvent("auxclick", { button: 1 }));
    expect(sendMessage).toHaveBeenCalledOnce();
  });
});
