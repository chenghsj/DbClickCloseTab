import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import english from "../_locales/en/messages.json";
import manifest from "../manifest.json";

const localesDirectory = resolve(import.meta.dirname, "../_locales");
const locales = readdirSync(localesDirectory);

interface Message {
  message: string;
  placeholders?: Record<string, { content: string }>;
}

describe("packaged locale catalogs", () => {
  it("localizes manifest metadata with an English default", () => {
    expect(manifest.default_locale).toBe("en");
    expect(manifest.name).toBe("__MSG_extensionName__");
    expect(manifest.description).toBe("__MSG_extensionDescription__");
    expect(manifest.action.default_title).toBe("__MSG_extensionName__");
    expect(locales.sort()).toEqual(["en", "ja", "ko", "zh_CN", "zh_TW"]);
  });

  it.each(locales)("%s has complete messages and valid placeholders", (locale) => {
    const catalog: Record<string, Message> = JSON.parse(
      readFileSync(resolve(localesDirectory, locale, "messages.json"), "utf8"),
    );
    expect(Object.keys(catalog).sort()).toEqual(Object.keys(english).sort());
    expect(catalog.extensionName.message.length).toBeLessThanOrEqual(75);
    expect(catalog.extensionDescription.message.length).toBeLessThanOrEqual(132);
    for (const [key, definition] of Object.entries(catalog)) {
      expect(definition.message.trim(), key).not.toBe("");
      const placeholders = [...definition.message.matchAll(/\$(\w+)\$/g)]
        .map((match) => match[1].toLowerCase()).sort();
      expect(placeholders, key).toEqual(Object.keys(definition.placeholders ?? {}).sort());
      for (const content of Object.values(definition.placeholders ?? {})) {
        expect(content.content, key).toMatch(/^\$[12]$/);
      }
    }
  });
});
