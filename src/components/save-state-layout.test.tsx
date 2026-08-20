import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExtensionEnabledField } from "@/components/extension-enabled-field";
import { ThemeSettingField } from "@/components/theme-setting-field";

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
        <ThemeSettingField
          loaded
          saveState="saving"
          setTheme={vi.fn()}
          theme="auto"
        />
      </>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
  });
});
