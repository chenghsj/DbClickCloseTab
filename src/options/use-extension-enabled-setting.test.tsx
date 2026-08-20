import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useExtensionEnabledSetting } from "@/options/use-extension-enabled-setting";
import { createExtensionSettings } from "@/shared/extension-settings";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

describe("useExtensionEnabledSetting", () => {
  it("reflects confirmed external setting changes", async () => {
    const storage = new InMemorySettingsStorage({ disabled: false });
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useExtensionEnabledSetting(settings));
    await act(() => settings.whenReady());
    expect(result.current.enabled).toBe(true);

    act(() => storage.emitExternalChange({ disabled: true }));

    expect(result.current.enabled).toBe(false);
    expect(result.current.saveState).toBe("idle");
  });

  it("keeps a confirmed external state when a pending write fails", async () => {
    const storage = new InMemorySettingsStorage({ disabled: false });
    let rejectWrite!: (error: Error) => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      () => new Promise<void>((_resolve, reject) => { rejectWrite = reject; }),
    );
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useExtensionEnabledSetting(settings));
    await act(() => settings.whenReady());

    act(() => result.current.setEnabled(false));
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange({ disabled: true }));
    await act(async () => {
      rejectWrite(new Error("unavailable"));
      await Promise.resolve();
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.saveState).toBe("error");
  });

  it("keeps an invalid readback in the error state", async () => {
    const storage = new InMemorySettingsStorage({ disabled: false });
    let finishWrite!: () => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      () => new Promise<void>((resolve) => { finishWrite = resolve; }),
    );
    const settings = createExtensionSettings(storage);
    const { result } = renderHook(() => useExtensionEnabledSetting(settings));
    await act(() => settings.whenReady());

    act(() => result.current.setEnabled(false));
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange({ disabled: "invalid" }));
    await act(async () => {
      finishWrite();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.saveState).toBe("error");
  });
});
