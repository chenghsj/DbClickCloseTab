import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PopupApp } from "@/popup/popup-app";
import { createExtensionSettings } from "@/shared/extension-settings";
import { applyLanguage } from "@/shared/i18n";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";
import type { Theme } from "@/shared/theme";

function mockSystemTheme(dark: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: dark,
    addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", () => query);
  return (nextDark: boolean) => {
    query.matches = nextDark;
    for (const listener of listeners) listener();
  };
}

beforeEach(() => mockSystemTheme(false));

afterEach(() => {
  vi.unstubAllGlobals();
  applyLanguage("auto", "popup");
  document.documentElement.classList.remove("dark");
  delete document.documentElement.dataset.theme;
});

describe("settings navigation", () => {
  it("toggles theme and supports keyboard language selection, saving both preferences", async () => {
    const storage = new InMemorySettingsStorage();
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    const theme = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(theme.closest("nav")).toBeInTheDocument();
    fireEvent.click(theme);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(storage.getStoredSettings().theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Language" }), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("option", { name: "日本語" }), { key: "Enter" });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(storage.getStoredSettings().language).toBe("ja");
    expect(document.documentElement.lang).toBe("ja");
    expect(screen.getByRole("switch", { name: "拡張機能を有効化" })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("combobox", { name: "言語" }), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("option", { name: "ブラウザーの言語" }), { key: "Enter" });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(storage.getStoredSettings().language).toBe("auto");
    expect(screen.getByRole("switch", { name: "Enable extension" })).toBeInTheDocument();
  });

  it.each(
    [false, true].flatMap(systemDark =>
      ([undefined, "auto", "light", "dark"] as const).map(storedTheme => ({ systemDark, storedTheme })),
    ),
  )("preserves legacy $storedTheme with system dark=$systemDark until toggled", async ({ storedTheme, systemDark }) => {
    mockSystemTheme(systemDark);
    const storage = new InMemorySettingsStorage(storedTheme ? { theme: storedTheme } : {});
    const write = vi.spyOn(storage, "write");
    const settings = createExtensionSettings(storage);
    const view = render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    const currentDark = storedTheme === "dark" || ((!storedTheme || storedTheme === "auto") && systemDark);
    const nextTheme: Theme = currentDark ? "light" : "dark";
    const action = currentDark ? "Switch to light theme" : "Switch to dark theme";
    expect(document.documentElement.classList.contains("dark")).toBe(currentDark);
    expect(settings.getSnapshot().settings.theme).toBe(storedTheme ?? "auto");
    expect(write).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: action }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(storage.getStoredSettings().theme).toBe(nextTheme);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(!currentDark);

    view.unmount();
    const reopenedSettings = createExtensionSettings(storage);
    render(<PopupApp settings={reopenedSettings} />);
    await act(() => reopenedSettings.whenReady());
    expect(reopenedSettings.getSnapshot().settings.theme).toBe(nextTheme);
    expect(screen.getByRole("button", {
      name: currentDark ? "Switch to dark theme" : "Switch to light theme",
    })).toBeEnabled();
  });

  it("tracks system changes until the user chooses a fixed theme", async () => {
    const changeSystemTheme = mockSystemTheme(false);
    const storage = new InMemorySettingsStorage({ theme: "auto" });
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    act(() => changeSystemTheme(true));
    expect(document.documentElement).toHaveClass("dark");
    expect(storage.getStoredSettings().theme).toBe("auto");
    fireEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    act(() => changeSystemTheme(false));
    act(() => changeSystemTheme(true));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(storage.getStoredSettings().theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeEnabled();
  });

  it("restores the system appearance and allows retry after a failed save", async () => {
    const storage = new InMemorySettingsStorage({ theme: "auto" });
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());
    storage.failNextWrite();
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeDisabled();
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(document.documentElement).not.toHaveClass("dark");
    expect(storage.getStoredSettings().theme).toBe("auto");
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn’t save the theme.");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeEnabled();
  });
});
