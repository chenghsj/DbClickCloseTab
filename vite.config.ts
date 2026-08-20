import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const extensionAssetNames = [
  "manifest.json",
  "icon.png",
  "icon-disable.png",
];

function extensionAssets(): Plugin {
  return {
    name: "extension-assets",
    apply: "build",
    generateBundle() {
      for (const fileName of extensionAssetNames) {
        this.emitFile({
          type: "asset",
          fileName,
          source: readFileSync(new URL(fileName, import.meta.url)),
        });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), extensionAssets()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        options: resolve(import.meta.dirname, "options.html"),
        popup: resolve(import.meta.dirname, "popup.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
  },
});
