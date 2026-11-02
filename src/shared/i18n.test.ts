import { afterEach, describe, expect, it, vi } from "vitest";

import { localizeDocument, t } from "@/shared/i18n";

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.lang = "en";
  document.title = "";
});

describe("extension translations", () => {
  it("uses English without extension APIs, including substituted bounds", () => {
    vi.stubGlobal("chrome", undefined);
    expect(t("enableExtension")).toBe("Enable extension");
    expect(t("intervalInvalid", ["100", "1000"])).toBe(
      "Enter a whole number from 100 to 1000.",
    );
    localizeDocument("options");
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("Double Middle-Click Close Tab Options");
  });

  it("uses browser messages and passes substitutions to the native API", () => {
    const getMessage = vi.fn().mockReturnValue("100～1000 の整数を入力してください。");
    vi.stubGlobal("chrome", { i18n: { getMessage } });
    expect(t("intervalInvalid", ["100", "1000"])).toBe(
      "100～1000 の整数を入力してください。",
    );
    expect(getMessage).toHaveBeenCalledWith("intervalInvalid", ["100", "1000"]);
  });

  it("falls back to English when a native message is unavailable", () => {
    vi.stubGlobal("chrome", { i18n: { getMessage: () => "" } });
    expect(t("intervalHelp", ["100", "1000"])).toBe(
      "100–1000 ms · Drag label to adjust.",
    );
  });
});
