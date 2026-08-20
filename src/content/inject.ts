import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";

async function initializeDoubleMiddleClick(): Promise<void> {
  const extensionSettings = getRuntimeExtensionSettings();
  const initialSnapshot = await extensionSettings.whenReady();
  let disabled =
    !initialSnapshot.confirmed.disabled || initialSnapshot.settings.disabled;
  let timeInterval = initialSnapshot.settings.timeInterval;

  let clicks = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function resetClicks(): void {
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = undefined;
    clicks = 0;
  }

  function handleAuxClick(event: MouseEvent): void {
    if (event.button !== 1) return;
    if (disabled) {
      resetClicks();
      return;
    }

    clicks++;
    if (clicks === 1) {
      timeout = setTimeout(resetClicks, timeInterval);
      return;
    }

    resetClicks();
    chrome.runtime.sendMessage({ closeTab: true });
  }

  extensionSettings.subscribe(() => {
    const nextSnapshot = extensionSettings.getSnapshot();
    const nextSettings = nextSnapshot.settings;
    const nextDisabled =
      !nextSnapshot.confirmed.disabled || nextSettings.disabled;
    const nextTimeInterval = nextSnapshot.confirmed.timeInterval
      ? nextSettings.timeInterval
      : timeInterval;
    if (
      disabled === nextDisabled &&
      timeInterval === nextTimeInterval
    ) {
      return;
    }
    disabled = nextDisabled;
    timeInterval = nextTimeInterval;
    resetClicks();
  });

  window.addEventListener("auxclick", handleAuxClick, false);
}

void initializeDoubleMiddleClick();
