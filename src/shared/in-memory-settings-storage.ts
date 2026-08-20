import type {
  ExtensionSettingsChange,
  SettingsStorageAdapter,
  StoredSettings,
} from "@/shared/extension-settings";

export class InMemorySettingsStorage implements SettingsStorageAdapter {
  private readonly listeners = new Set<(change: StoredSettings) => void>();
  private nextReadError: Error | undefined;
  private nextWriteError: Error | undefined;
  private values: StoredSettings;

  constructor(initialValues: StoredSettings = {}) {
    this.values = { ...initialValues };
  }

  read(): Promise<StoredSettings> {
    if (this.nextReadError) {
      const error = this.nextReadError;
      this.nextReadError = undefined;
      return Promise.reject(error);
    }
    return Promise.resolve({ ...this.values });
  }

  subscribe(listener: (change: StoredSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async write(change: ExtensionSettingsChange): Promise<void> {
    if (this.nextWriteError) {
      const error = this.nextWriteError;
      this.nextWriteError = undefined;
      throw error;
    }
    this.values = { ...this.values, ...change };
    for (const listener of this.listeners) listener(change);
  }

  getStoredSettings(): StoredSettings {
    return { ...this.values };
  }

  emitExternalChange(change: StoredSettings): void {
    this.values = { ...this.values, ...change };
    for (const listener of this.listeners) listener(change);
  }

  failNextRead(error = new Error("Settings read failed.")): void {
    this.nextReadError = error;
  }

  failNextWrite(error = new Error("Settings write failed.")): void {
    this.nextWriteError = error;
  }
}
