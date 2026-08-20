import { afterEach, describe, expect, it, vi } from "vitest";

import { applyTheme, normalizeTheme } from "@/shared/theme";

function installColorSchemeMock(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  );
}

describe("theme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.theme;
  });

  it("defaults unknown values to automatic", () => {
    expect(normalizeTheme(undefined)).toBe("auto");
    expect(normalizeTheme("sepia")).toBe("auto");
  });

  it("resolves automatic from the system and honors explicit themes", () => {
    installColorSchemeMock(true);

    applyTheme("auto");
    expect(document.documentElement).toHaveAttribute("data-theme", "auto");
    expect(document.documentElement).toHaveClass("dark");

    applyTheme("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).not.toHaveClass("dark");

    applyTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveClass("dark");
  });
});
