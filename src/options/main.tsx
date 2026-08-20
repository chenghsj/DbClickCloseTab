import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { OptionsApp } from "@/options/options-app";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";
import { applyTheme } from "@/shared/theme";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Options root element is missing.");

async function bootstrap(): Promise<void> {
  const settings = getRuntimeExtensionSettings();
  const snapshot = await settings.whenReady();
  applyTheme(snapshot.settings.theme);
  createRoot(rootElement as HTMLElement).render(
    <StrictMode>
      <OptionsApp settings={settings} />
    </StrictMode>,
  );
}

void bootstrap();
