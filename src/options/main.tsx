import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { OptionsApp } from "@/options/options-app";
import { applyLanguage, localizeDocument } from "@/shared/i18n";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";
import { applyTheme } from "@/shared/theme";

localizeDocument("options");
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Options root element is missing.");

async function bootstrap(): Promise<void> {
  const settings = getRuntimeExtensionSettings();
  const snapshot = await settings.whenReady();
  applyTheme(snapshot.settings.theme);
  applyLanguage(snapshot.settings.language, "options");
  createRoot(rootElement as HTMLElement).render(
    <StrictMode>
      <OptionsApp settings={settings} />
    </StrictMode>,
  );
}

void bootstrap();
