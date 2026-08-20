import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThemeSetting } from "@/options/use-theme-setting";
import { createExtensionSettings } from "@/shared/extension-settings";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

describe("useThemeSetting", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ addEventListener() {}, matches: false, removeEventListener() {} }),
    });
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.theme;
  });

  it("defaults to automatic and saves an explicit dark theme", async () => {
    const storage = new InMemorySettingsStorage();
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useThemeSetting(settings));
    await act(() => settings.whenReady());

    expect(result.current.theme).toBe("auto");
    act(() => result.current.setTheme("dark"));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    expect(storage.getStoredSettings().theme).toBe("dark");
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("applies confirmed external theme changes", async () => {
    const storage = new InMemorySettingsStorage({ theme: "light" });
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useThemeSetting(settings));
    await act(() => settings.whenReady());

    act(() => storage.emitExternalChange({ theme: "dark" }));

    expect(result.current.loaded).toBe(true);
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("keeps a confirmed external theme when a pending write fails", async () => {
    const storage = new InMemorySettingsStorage({ theme: "light" });
    let rejectWrite!: (error: Error) => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      () => new Promise<void>((_resolve, reject) => { rejectWrite = reject; }),
    );
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useThemeSetting(settings));
    await act(() => settings.whenReady());

    act(() => result.current.setTheme("dark"));
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange({ theme: "auto" }));
    await act(async () => {
      rejectWrite(new Error("unavailable"));
      await Promise.resolve();
    });

    expect(result.current.theme).toBe("auto");
    expect(result.current.saveState).toBe("error");
  });

  it("keeps an invalid readback in the error state", async () => {
    const storage = new InMemorySettingsStorage({ theme: "light" });
    let finishWrite!: () => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      () => new Promise<void>((resolve) => { finishWrite = resolve; }),
    );
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useThemeSetting(settings));
    await act(() => settings.whenReady());

    act(() => result.current.setTheme("dark"));
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange({ theme: "sepia" }));
    await act(async () => {
      finishWrite();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.saveState).toBe("error");
  });
});
