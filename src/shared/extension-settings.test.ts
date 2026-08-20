import { describe, expect, it, vi } from "vitest";

import {
  createExtensionSettings,
  DEFAULT_EXTENSION_SETTINGS,
  type ExtensionSettingsChange,
  type SettingsStorageAdapter,
  type StoredSettings,
} from "@/shared/extension-settings";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

class ControlledStorage implements SettingsStorageAdapter {
  readonly readResult = deferred<StoredSettings>();
  readonly writes: ExtensionSettingsChange[] = [];
  readonly writeResults: Array<ReturnType<typeof deferred<void>>> = [];
  private readonly listeners = new Set<(change: StoredSettings) => void>();
  private nextReadError: Error | undefined;

  read(): Promise<StoredSettings> {
    if (this.nextReadError) {
      const error = this.nextReadError;
      this.nextReadError = undefined;
      return Promise.reject(error);
    }
    return this.readResult.promise;
  }

  subscribe(listener: (change: StoredSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  write(change: ExtensionSettingsChange): Promise<void> {
    this.writes.push(change);
    const result = deferred<void>();
    this.writeResults.push(result);
    return result.promise;
  }

  emit(change: StoredSettings): void {
    for (const listener of this.listeners) listener(change);
  }

  failNextRead(error = new Error("unavailable")): void {
    this.nextReadError = error;
  }
}

describe("extension settings module", () => {
  it("normalizes one legacy interval shape but rejects other invalid values", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);

    storage.readResult.resolve({
      disabled: "false",
      theme: "sepia",
      timeInterval: "650",
    });
    const snapshot = await settings.whenReady();

    expect(snapshot).toEqual({
      confirmed: { disabled: false, theme: false, timeInterval: true },
      settings: {
        disabled: false,
        theme: "auto",
        timeInterval: 650,
      },
      status: "ready",
    });
  });

  it("preserves a legacy positive interval outside the current editing range", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);

    storage.readResult.resolve({ timeInterval: "1500" });

    await expect(settings.whenReady()).resolves.toMatchObject({
      settings: { timeInterval: 1500 },
      status: "ready",
    });
  });

  it("preserves a legacy positive fractional interval", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);

    storage.readResult.resolve({ timeInterval: "650.5" });

    await expect(settings.whenReady()).resolves.toMatchObject({
      settings: { timeInterval: 650.5 },
      status: "ready",
    });
  });

  it("keeps changes that arrive while the initial read is pending", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);

    storage.emit({ disabled: true, theme: "dark" });
    storage.readResult.resolve({ disabled: false, theme: "light", timeInterval: 700 });

    await expect(settings.whenReady()).resolves.toEqual({
      confirmed: { disabled: true, theme: true, timeInterval: true },
      settings: { disabled: true, theme: "dark", timeInterval: 700 },
      status: "ready",
    });
  });

  it("uses defaults after a read error and recovers on a storage change", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);
    const listener = vi.fn();
    settings.subscribe(listener);

    storage.readResult.reject(new Error("unavailable"));
    await expect(settings.whenReady()).resolves.toEqual({
      confirmed: { disabled: false, theme: false, timeInterval: false },
      settings: DEFAULT_EXTENSION_SETTINGS,
      status: "error",
    });

    storage.emit({ disabled: true });
    expect(settings.getSnapshot()).toEqual({
      confirmed: { disabled: true, theme: false, timeInterval: false },
      settings: { ...DEFAULT_EXTENSION_SETTINGS, disabled: true },
      status: "ready",
    });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("confirms a successful write even when storage emits no change event", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);
    storage.readResult.reject(new Error("unavailable"));
    await settings.whenReady();

    const update = settings.update({ disabled: false });
    await Promise.resolve();
    storage.writeResults[0].resolve();
    await update;

    expect(settings.getSnapshot()).toMatchObject({
      confirmed: { disabled: true },
      settings: { disabled: false },
      status: "ready",
    });
  });

  it("keeps the stored value when it changes while a write is pending", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);
    storage.readResult.resolve({ disabled: false });
    await settings.whenReady();

    const update = settings.update({ disabled: true });
    await Promise.resolve();
    storage.emit({ disabled: false });
    storage.writeResults[0].resolve();
    await update;

    expect(settings.getSnapshot()).toMatchObject({
      confirmed: { disabled: true },
      settings: { disabled: false },
      status: "ready",
    });
  });

  it("keeps an observed value when confirmation after a write fails", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);
    storage.readResult.resolve({ disabled: false });
    await settings.whenReady();

    const update = settings.update({ disabled: true });
    await Promise.resolve();
    storage.emit({ disabled: true });
    storage.failNextRead();
    storage.writeResults[0].resolve();

    await expect(update).resolves.toBeUndefined();
    expect(settings.getSnapshot()).toMatchObject({
      confirmed: { disabled: true },
      settings: { disabled: true },
      status: "ready",
    });
  });

  it("does not let an older read error override a newer storage change", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);

    storage.emit({ disabled: true });
    storage.readResult.reject(new Error("unavailable"));

    await expect(settings.whenReady()).resolves.toEqual({
      confirmed: { disabled: true, theme: false, timeInterval: false },
      settings: { ...DEFAULT_EXTENSION_SETTINGS, disabled: true },
      status: "ready",
    });
  });

  it("does not recover from a read error on malformed storage changes", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);

    storage.emit({ theme: "dark" });
    storage.emit({ theme: "sepia" });
    storage.readResult.reject(new Error("unavailable"));
    await expect(settings.whenReady()).resolves.toEqual({
      confirmed: { disabled: false, theme: false, timeInterval: false },
      settings: DEFAULT_EXTENSION_SETTINGS,
      status: "error",
    });

    storage.emit({ disabled: "false" });
    expect(settings.getSnapshot().status).toBe("error");

    storage.emit({ theme: "dark" });
    expect(settings.getSnapshot()).toEqual({
      confirmed: { disabled: false, theme: true, timeInterval: false },
      settings: { ...DEFAULT_EXTENSION_SETTINGS, theme: "dark" },
      status: "ready",
    });
  });

  it("serializes writes to the same setting while allowing other settings through", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);
    storage.readResult.resolve({});
    await settings.whenReady();

    const firstInterval = settings.update({ timeInterval: 500 });
    const latestInterval = settings.update({ timeInterval: 600 });
    const theme = settings.update({ theme: "dark" });
    await Promise.resolve();
    await Promise.resolve();

    expect(storage.writes).toEqual([
      { timeInterval: 500 },
      { theme: "dark" },
    ]);

    storage.writeResults[1].resolve();
    await theme;
    expect(storage.writes).toHaveLength(2);

    storage.writeResults[0].resolve();
    await firstInterval;
    await vi.waitFor(() => {
      expect(storage.writes[2]).toEqual({ timeInterval: 600 });
    });

    storage.writeResults[2].resolve();
    await latestInterval;
  });

  it("writes and publishes a multi-field partial change atomically", async () => {
    const storage = new InMemorySettingsStorage();
    const settings = createExtensionSettings(storage);
    await settings.whenReady();
    const listener = vi.fn();
    settings.subscribe(listener);

    await settings.update({ disabled: true, theme: "dark" });

    expect(storage.getStoredSettings()).toMatchObject({
      disabled: true,
      theme: "dark",
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(settings.getSnapshot().settings).toMatchObject({
      disabled: true,
      theme: "dark",
    });
  });

  it("rejects invalid runtime changes before crossing the storage seam", async () => {
    const storage = new ControlledStorage();
    const settings = createExtensionSettings(storage);
    storage.readResult.resolve({});
    await settings.whenReady();

    await expect(
      settings.update({ timeInterval: 50 } as ExtensionSettingsChange),
    ).rejects.toThrow("Invalid timeInterval");
    await expect(
      settings.update({ timeInterval: "650" } as unknown as ExtensionSettingsChange),
    ).rejects.toThrow("Invalid timeInterval");
    expect(storage.writes).toHaveLength(0);
  });
});
