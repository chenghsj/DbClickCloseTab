import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import english from "../../_locales/en/messages.json";
import japanese from "../../_locales/ja/messages.json";
import korean from "../../_locales/ko/messages.json";
import simplifiedChinese from "../../_locales/zh_CN/messages.json";
import traditionalChinese from "../../_locales/zh_TW/messages.json";
import { OptionsApp } from "@/options/options-app";
import { PopupApp } from "@/popup/popup-app";
import { createExtensionSettings } from "@/shared/extension-settings";
import { localizeDocument } from "@/shared/i18n";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

const catalogs = {
  en: english, zh_TW: traditionalChinese, zh_CN: simplifiedChinese,
  ja: japanese, ko: korean,
};

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.lang = "en";
  document.title = "";
});

describe.each(Object.entries(catalogs))("%s settings interface", (_, catalog) => {
  function mockBrowserMessages() {
    vi.stubGlobal("chrome", {
      i18n: {
        getMessage(key: keyof typeof english, values: string[] = []) {
          const entry = catalog[key];
          return entry.message
            .replaceAll("$minimum$", values[0] ?? "")
            .replaceAll("$maximum$", values[1] ?? "");
        },
      },
    });
  }

  it("localizes the popup and preserves toggle and validation behavior", async () => {
    mockBrowserMessages();
    localizeDocument("popup");
    const storage = new InMemorySettingsStorage();
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    expect(document.documentElement.lang).toBe(catalog.language.message);
    expect(document.title).toBe(catalog.extensionName.message);
    expect(screen.getByRole("heading", { name: "Double Middle-Click" })).toBeInTheDocument();
    const enableSwitch = screen.getByRole("switch", { name: catalog.enableExtension.message });
    expect(enableSwitch).toBeChecked();
    expect(screen.getByRole("button", { name: catalog.switchToDark.message })).toBeEnabled();
    expect(screen.getByRole("link", { name: catalog.githubLabel.message })).toBeInTheDocument();

    fireEvent.click(enableSwitch);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(enableSwitch).not.toBeChecked();
    expect(storage.getStoredSettings().disabled).toBe(true);

    const input = screen.getByRole("spinbutton", { name: catalog.interval.message });
    expect(screen.getByText(catalog.interval.message)).toHaveAttribute("title", catalog.intervalDrag.message);
    fireEvent.change(input, { target: { value: "50" } });
    expect(screen.getByRole("alert")).toHaveTextContent(
      catalog.intervalInvalid.message.replace("$minimum$", "100").replace("$maximum$", "1000"),
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("localizes options help and storage failure messages", async () => {
    mockBrowserMessages();
    localizeDocument("options");
    const storage = new InMemorySettingsStorage();
    const settings = createExtensionSettings(storage);
    render(<OptionsApp settings={settings} />);
    await act(() => settings.whenReady());

    expect(document.title).toBe(catalog.optionsTitle.message);
    for (const key of ["optionsSubtitle", "enableHelp"] as const) {
      expect(screen.getByText(catalog[key].message)).toBeInTheDocument();
    }
    expect(screen.getByText(
      catalog.intervalHelp.message.replace("$minimum$", "100").replace("$maximum$", "1000"),
    )).toBeInTheDocument();

    storage.failNextWrite();
    fireEvent.click(screen.getByRole("switch", { name: catalog.enableExtension.message }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByRole("alert")).toHaveTextContent(catalog.enableError.message);
  });
});
