import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useLanguageSetting } from "@/options/use-language-setting";
import { createExtensionSettings } from "@/shared/extension-settings";
import { applyLanguage, t } from "@/shared/i18n";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

afterEach(() => applyLanguage("auto", "popup"));

describe("language preference", () => {
  it("restores a saved language, saves changes, and applies external changes", async () => {
    const storage = new InMemorySettingsStorage({ language: "ja" });
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useLanguageSetting(settings, "options"));
    await act(() => settings.whenReady());
    expect(result.current.language).toBe("ja");
    expect(document.documentElement.lang).toBe("ja");
    expect(t("theme")).toBe("テーマ");

    act(() => result.current.setLanguage("ko"));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(storage.getStoredSettings().language).toBe("ko");
    expect(document.documentElement.lang).toBe("ko");

    act(() => storage.emitExternalChange({ language: "en" }));
    expect(result.current.language).toBe("en");
    expect(t("theme")).toBe("Theme");
  });

  it("rolls back failed writes to the latest confirmed language", async () => {
    const storage = new InMemorySettingsStorage({ language: "en" });
    let rejectWrite!: (error: Error) => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      () => new Promise<void>((_, reject) => { rejectWrite = reject; }),
    );
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useLanguageSetting(settings, "popup"));
    await act(() => settings.whenReady());
    act(() => result.current.setLanguage("ko"));
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange({ language: "ja" }));
    await act(async () => { rejectWrite(new Error("unavailable")); await Promise.resolve(); });
    expect(result.current.language).toBe("ja");
    expect(result.current.saveState).toBe("error");
    expect(document.documentElement.lang).toBe("ja");
  });

  it("defaults missing preferences to browser language and rejects invalid values", async () => {
    const storage = new InMemorySettingsStorage();
    const settings = createExtensionSettings(storage);
    await settings.whenReady();
    expect(settings.getSnapshot().settings.language).toBe("auto");
    await expect(settings.update({ language: "invalid" } as never)).rejects.toThrow("Invalid language");
    storage.emitExternalChange({ language: "invalid" });
    expect(settings.getSnapshot().confirmed.language).toBe(false);
  });

  it.each([
    { setting: "theme", change: { theme: "dark" } },
    { setting: "interval", change: { timeInterval: 650 } },
    { setting: "enabled", change: { disabled: true } },
  ])("keeps a language choice locked while $setting changes during its save", async ({ change }) => {
    const storage = new InMemorySettingsStorage({ language: "en" });
    const originalWrite = storage.write.bind(storage);
    let finishWrite!: () => void;
    vi.spyOn(storage, "write").mockImplementationOnce(change => new Promise<void>(resolve => {
      finishWrite = () => { void originalWrite(change).then(resolve); };
    }));
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useLanguageSetting(settings, "popup"));
    await act(() => settings.whenReady());

    act(() => result.current.setLanguage("ja"));
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange(change));

    expect(result.current.language).toBe("ja");
    expect(document.documentElement.lang).toBe("ja");
    expect(result.current.saveState).toBe("saving");

    await act(async () => { finishWrite(); await Promise.resolve(); await Promise.resolve(); });
    expect(storage.getStoredSettings().language).toBe("ja");
    expect(result.current.language).toBe("ja");
    expect(result.current.saveState).toBe("idle");
  });

  it("keeps a save error visible across unrelated setting changes", async () => {
    const storage = new InMemorySettingsStorage({ language: "en" });
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useLanguageSetting(settings, "popup"));
    await act(() => settings.whenReady());
    storage.failNextWrite();

    act(() => result.current.setLanguage("ja"));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(result.current.saveState).toBe("error");
    act(() => storage.emitExternalChange({ theme: "dark" }));
    expect(result.current.language).toBe("en");
    expect(result.current.saveState).toBe("error");
  });
});
