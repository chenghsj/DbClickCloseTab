import { createChromeSettingsStorage } from "@/shared/chrome-settings-storage";
import {
  createExtensionSettings,
  type ExtensionSettingsModule,
} from "@/shared/extension-settings";

let runtimeSettings: ExtensionSettingsModule | undefined;

export function getRuntimeExtensionSettings(): ExtensionSettingsModule {
  runtimeSettings ??= createExtensionSettings(createChromeSettingsStorage());
  return runtimeSettings;
}
