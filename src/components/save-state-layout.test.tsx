import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExtensionEnabledField } from "@/components/extension-enabled-field";
import { SettingsNavigation } from "@/components/settings-navigation";

describe("settings save-state layout", () => {
  it("does not insert transient status content while settings are saving", () => {
    render(
      <>
        <ExtensionEnabledField
          enabled
          loaded
          saveState="saving"
          setEnabled={vi.fn()}
        />
        <SettingsNavigation
          themeSetting={{ loaded: true, saveState: "saving", setTheme: vi.fn(), theme: "auto", resolvedTheme: "light" }}
          languageSetting={{ loaded: true, saveState: "saving", setLanguage: vi.fn(), language: "auto" }}
        />
      </>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
  });
});
