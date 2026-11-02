import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { PopupApp } from "@/popup/popup-app";
import { applyLanguage, localizeDocument } from "@/shared/i18n";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";
import { applyTheme } from "@/shared/theme";

localizeDocument("popup");
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Popup root element is missing.");

async function bootstrap(): Promise<void> {
  const settings = getRuntimeExtensionSettings();
  const snapshot = await settings.whenReady();
  applyTheme(snapshot.settings.theme);
  applyLanguage(snapshot.settings.language, "popup");
  createRoot(rootElement as HTMLElement).render(
    <StrictMode>
      <PopupApp settings={settings} />
    </StrictMode>,
  );
}

void bootstrap();
