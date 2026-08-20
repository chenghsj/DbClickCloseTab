import { describe, expect, it } from "vitest";

import manifest from "../manifest.json";

describe("extension manifest", () => {
  it("opens options as a full page without the embedded close control", () => {
    expect(manifest.options_ui).toEqual({
      page: "options.html",
      open_in_tab: true,
    });
  });
});
