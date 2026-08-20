import { resolve } from "node:path";
import { defineConfig } from "vite";

const runtimeEntries = {
  background: {
    entry: "src/background/index.ts",
    fileName: "bg.js",
    name: "DbClickCloseTabBackground",
  },
  content: {
    entry: "src/content/inject.ts",
    fileName: "inject.js",
    name: "DbClickCloseTabContent",
  },
} as const;

export default defineConfig(({ mode }) => {
  if (mode !== "background" && mode !== "content") {
    throw new Error(`Unknown extension runtime build mode: ${mode}`);
  }
  const runtime = runtimeEntries[mode];

  return {
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: resolve(import.meta.dirname, runtime.entry),
        fileName: () => runtime.fileName,
        formats: ["iife"],
        name: runtime.name,
      },
      outDir: resolve(import.meta.dirname, "dist"),
    },
  };
});
