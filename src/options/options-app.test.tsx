import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OptionsApp } from "@/options/options-app";
import { createExtensionSettings } from "@/shared/extension-settings";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

function renderOptions(storage = new InMemorySettingsStorage({ timeInterval: 400 })) {
  const settings = createExtensionSettings(storage);
  const view = render(<OptionsApp settings={settings} />);
  return { settings, storage, ...view };
}

describe("OptionsApp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("saves a valid interval on Enter without a save button", async () => {
    const { settings, storage } = renderOptions();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());

    const input = screen.getByRole("spinbutton", { name: "Double-click interval" });
    const theme = screen.getByRole("combobox", { name: "Theme" });
    expect(input).toHaveValue(400);
    const unit = screen.getByText("ms", { exact: true });
    expect(unit.parentElement).toHaveAttribute("data-slot", "input-with-suffix");
    expect(unit.parentElement).toContainElement(input);
    expect(unit.parentElement).toHaveClass("flex", "h-8", "rounded-lg");
    expect(unit.parentElement).toHaveClass("w-32", "shrink-0");
    expect(theme).toHaveClass("h-8", "w-32", "shrink-0");
    expect(unit).not.toHaveClass("absolute");
    expect(unit.parentElement?.lastElementChild).toBe(unit);
    expect(input.className).not.toContain("appearance:textfield");
    expect(input.className).not.toContain("spin-button");
    const intervalHelp = screen.getByText("100–1000 ms · Drag label to adjust.");
    expect(intervalHelp).toBeInTheDocument();
    expect(intervalHelp).toHaveClass("mt-0.5");
    expect(intervalHelp.parentElement).toHaveClass("min-w-0");
    expect(intervalHelp.parentElement).toContainElement(
      screen.getByText("Double-click interval"),
    );
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();

    input.focus();
    fireEvent.change(input, { target: { value: "550" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(input).not.toBeDisabled();
    fireEvent.keyDown(input, { key: "Enter" });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    expect(write).toHaveBeenCalledWith({ timeInterval: 550 });
    expect(storage.getStoredSettings().timeInterval).toBe(550);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("saves a pending valid interval when the Options page closes", async () => {
    const { settings, storage } = renderOptions();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "550" },
    });
    expect(write).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("pagehide"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(write).toHaveBeenCalledWith({ timeInterval: 550 });
    expect(storage.getStoredSettings().timeInterval).toBe(550);
  });

  it("locks interval edits only after the edit is committed", async () => {
    const { settings, storage } = renderOptions();
    await act(() => settings.whenReady());
    const originalWrite = storage.write.bind(storage);
    let finishSave!: () => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      (change) =>
        new Promise<void>((resolve) => {
          finishSave = () => {
            void originalWrite(change).then(resolve);
          };
        }),
    );
    const input = screen.getByRole("spinbutton");

    input.focus();
    fireEvent.change(input, { target: { value: "500" } });
    expect(input).not.toBeDisabled();
    input.blur();
    await act(() => Promise.resolve());
    expect(input).toBeDisabled();

    await act(async () => {
      finishSave();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(input).not.toBeDisabled();
  });

  it("does not store an invalid interval", async () => {
    const { settings, storage } = renderOptions();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());

    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "50" } });
    expect(screen.getByRole("alert")).toHaveTextContent("100 to 1000");
    input.blur();
    expect(write).not.toHaveBeenCalled();
  });

  it("keeps the load error visible until the user enters a valid value", async () => {
    const storage = new InMemorySettingsStorage({ timeInterval: 400 });
    storage.failNextRead(new Error("unavailable"));
    const { settings } = renderOptions(storage);
    await act(() => settings.whenReady());

    expect(screen.getByRole("spinbutton")).toHaveValue(400);
    expect(screen.getByText(/Couldn’t load the saved interval/)).toBeInTheDocument();
  });

  it("retries the fallback interval after a load error", async () => {
    const storage = new InMemorySettingsStorage({ timeInterval: 700 });
    storage.failNextRead(new Error("unavailable"));
    const write = vi.spyOn(storage, "write");
    const { settings } = renderOptions(storage);
    await act(() => settings.whenReady());
    const input = screen.getByRole("spinbutton");

    input.focus();
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.change(input, { target: { value: "400" } });
    input.blur();
    await act(() => Promise.resolve());

    expect(write).toHaveBeenCalledWith({ timeInterval: 400 });
  });

  it("shows a save error and re-enables automatic retries", async () => {
    const storage = new InMemorySettingsStorage({ timeInterval: 400 });
    const { settings } = renderOptions(storage);
    await act(() => settings.whenReady());
    storage.failNextWrite(new Error("quota"));

    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "500" } });
    input.blur();
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    expect(screen.getByRole("alert")).toHaveTextContent("Couldn’t save");
    expect(screen.getByRole("spinbutton")).not.toBeDisabled();
  });

  it("adopts a confirmed external interval when a pending save finishes", async () => {
    const { settings, storage } = renderOptions();
    await act(() => settings.whenReady());
    let finishSave!: () => void;
    vi.spyOn(storage, "write").mockImplementationOnce(
      () => new Promise<void>((resolve) => { finishSave = resolve; }),
    );
    const input = screen.getByRole("spinbutton");

    input.focus();
    fireEvent.change(input, { target: { value: "500" } });
    input.blur();
    await act(() => Promise.resolve());
    act(() => storage.emitExternalChange({ timeInterval: 600 }));
    await act(async () => {
      finishSave();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(input).toHaveValue(600);
    expect(storage.getStoredSettings().timeInterval).toBe(600);
  });

  it("reflects interval changes received from extension storage", async () => {
    const { settings, storage } = renderOptions();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());

    act(() => storage.emitExternalChange({ timeInterval: 725 }));

    expect(screen.getByRole("spinbutton")).toHaveValue(725);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    expect(write).not.toHaveBeenCalled();
  });

  it("shows the project repository link", async () => {
    const { settings } = renderOptions();
    await act(() => settings.whenReady());

    expect(screen.getByRole("link", { name: "View Double Middle-Click on GitHub" }))
      .toHaveAttribute("href", "https://github.com/chenghsj/DbClickCloseTab");
  });
});
