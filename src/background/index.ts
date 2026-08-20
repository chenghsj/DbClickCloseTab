import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";

const ACTION_ICONS = {
  enabled: "icon.png",
  disabled: "icon-disable.png",
};

function updateActionIcon(disabled: boolean): void {
  chrome.action.setIcon(
    { path: disabled ? ACTION_ICONS.disabled : ACTION_ICONS.enabled },
    () => chrome.runtime.lastError,
  );
}

const extensionSettings = getRuntimeExtensionSettings();
let displayedDisabled: boolean | undefined;

function syncActionIcon(): void {
  const snapshot = extensionSettings.getSnapshot();
  if (snapshot.status === "loading") return;
  const disabled = !snapshot.confirmed.disabled || snapshot.settings.disabled;
  if (displayedDisabled === disabled) return;
  displayedDisabled = disabled;
  updateActionIcon(displayedDisabled);
}

extensionSettings.subscribe(syncActionIcon);
void extensionSettings.whenReady().then(syncActionIcon);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === "complete") {
    chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["inject.js"] }, () => chrome.runtime.lastError);
  }
});
chrome.runtime.onMessage.addListener(function (
  message: { closeTab?: boolean },
  sender,
) {
  const tabId = sender.tab?.id;
  if (message.closeTab && tabId !== undefined) chrome.tabs.remove(tabId);
});
