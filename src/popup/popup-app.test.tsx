import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PopupApp } from "@/popup/popup-app";
import { createExtensionSettings } from "@/shared/extension-settings";
import { InMemorySettingsStorage } from "@/shared/in-memory-settings-storage";

function renderPopup() {
  const storage = new InMemorySettingsStorage({ timeInterval: 650 });
  const settings = createExtensionSettings(storage);
  const view = render(<PopupApp settings={settings} />);
  return { settings, storage, ...view };
}

describe("PopupApp", () => {
  beforeEach(() => vi.useFakeTimers());

  it("saves a pending interval when the popup closes", async () => {
    const { container, settings, storage } = renderPopup();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());

    const input = screen.getByRole("spinbutton", { name: "Double-click interval" });
    expect(input).toHaveValue(650);
    expect(container.querySelector("header img")).toHaveClass("size-7");
    expect(container.querySelector("main")).toHaveClass(
      "w-[22rem]",
      "max-w-full",
      "p-2.5",
    );
    expect(container.querySelector("main > div")).toHaveClass("w-full");
    expect(container.querySelector("header")).toHaveClass("gap-2", "px-1");
    expect(
      screen.getByRole("heading", { name: "Double Middle-Click" }),
    ).toHaveClass("text-base");
    expect(container.querySelector('[data-slot="card"]')).toHaveClass(
      "mt-1",
      "w-full",
    );
    expect(
      screen.queryByText("100–1000 ms · Drag label to adjust."),
    ).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-describedby");
    fireEvent.change(input, { target: { value: "700" } });
    expect(write).not.toHaveBeenCalled();
    fireEvent(window, new Event("pagehide"));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    expect(write).toHaveBeenCalledWith({ timeInterval: 700 });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("locks interval edits while a save is in flight", async () => {
    const { settings, storage } = renderPopup();
    await act(() => settings.whenReady());
    const originalWrite = storage.write.bind(storage);
    let finishFirstSave!: () => void;
    const write = vi
      .spyOn(storage, "write")
      .mockImplementationOnce(
        (change) =>
          new Promise<void>((resolve) => {
            finishFirstSave = () => {
              void originalWrite(change).then(resolve);
            };
          }),
      )
      .mockImplementation(originalWrite);
    const input = screen.getByRole("spinbutton", {
      name: "Double-click interval",
    });

    input.focus();
    fireEvent.change(input, { target: { value: "700" } });
    input.blur();
    await act(() => Promise.resolve());
    expect(input).toBeDisabled();
    fireEvent.change(input, { target: { value: "800" } });
    expect(input).toHaveValue(700);
    const label = screen.getByText("Double-click interval");
    expect(label).toHaveAttribute("aria-disabled", "true");
    fireEvent.pointerDown(label, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(label, { clientX: 140, pointerId: 1 });
    fireEvent.pointerUp(label, { clientX: 140, pointerId: 1 });
    expect(input).toHaveValue(700);
    expect(write).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishFirstSave();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(input).not.toBeDisabled();
    expect(storage.getStoredSettings().timeInterval).toBe(700);
  });

  it("lets the user pause while typing a multi-digit interval", async () => {
    const { settings, storage } = renderPopup();
    const write = vi.spyOn(storage, "write").mockImplementation(
      () => new Promise<void>(() => {}),
    );
    await act(() => settings.whenReady());
    const input = screen.getByRole("spinbutton", {
      name: "Double-click interval",
    });

    input.focus();
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.change(input, { target: { value: "10" } });
    fireEvent.change(input, { target: { value: "100" } });
    await act(() => vi.advanceTimersByTime(400));
    fireEvent.change(input, { target: { value: "1000" } });

    expect(input).toHaveValue(1000);
    expect(write).not.toHaveBeenCalled();
    input.blur();
    await act(() => Promise.resolve());
    expect(write).toHaveBeenCalledWith({ timeInterval: 1000 });
  });

  it("rejects an invalid interval", async () => {
    const { settings, storage } = renderPopup();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "50" } });
    expect(screen.getByRole("alert")).toHaveTextContent("100 to 1000");
    expect(input).toHaveAttribute("aria-describedby", "save-status");
    expect(write).not.toHaveBeenCalled();
  });

  it("blurs the interval input on wheel so scrolling cannot change its value", async () => {
    const { settings } = renderPopup();
    await act(() => settings.whenReady());
    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.wheel(input, { deltaY: -100 });
    expect(input).not.toHaveFocus();
    expect(input).toHaveValue(650);
  });

  it("adjusts and clamps the interval when dragging the label horizontally", async () => {
    const { settings, storage } = renderPopup();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());
    const label = screen.getByText("Double-click interval");
    const input = screen.getByRole("spinbutton");

    fireEvent.pointerDown(label, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(label, { clientX: 140, pointerId: 1 });
    expect(write).not.toHaveBeenCalled();
    fireEvent.pointerUp(label, { clientX: 140, pointerId: 1 });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(input).toHaveValue(700);
    expect(write).toHaveBeenCalledWith({ timeInterval: 700 });

    fireEvent.pointerDown(label, { button: 0, clientX: 0, pointerId: 2 });
    fireEvent.pointerMove(label, { clientX: 1000, pointerId: 2 });
    fireEvent.pointerUp(label, { clientX: 1000, pointerId: 2 });
    expect(input).toHaveValue(1000);
  });

  it("discards the drag preview when the pointer is canceled", async () => {
    const { settings, storage } = renderPopup();
    const write = vi.spyOn(storage, "write");
    await act(() => settings.whenReady());
    const label = screen.getByText("Double-click interval");
    const input = screen.getByRole("spinbutton");
    fireEvent.pointerDown(label, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(label, { clientX: 140, pointerId: 1 });
    expect(input).toHaveValue(700);
    fireEvent.pointerCancel(label, { pointerId: 1 });
    expect(input).toHaveValue(650);
    expect(write).not.toHaveBeenCalled();
  });

  it("enables the extension by default and pauses it when switched off", async () => {
    const { settings, storage } = renderPopup();
    await act(() => settings.whenReady());
    const enableSwitch = screen.getByRole("switch", { name: "Enable extension" });
    expect(enableSwitch).toBeChecked();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    fireEvent.click(enableSwitch);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(enableSwitch).not.toBeChecked();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(storage.getStoredSettings().disabled).toBe(true);
  });

  it("shows a failed enabled-setting load as paused and allows enabling it", async () => {
    const storage = new InMemorySettingsStorage({ disabled: true, timeInterval: 650 });
    storage.failNextRead(new Error("unavailable"));
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    const enableSwitch = screen.getByRole("switch", { name: "Enable extension" });
    expect(enableSwitch).not.toBeChecked();
    expect(screen.getByText("Paused")).toBeInTheDocument();

    fireEvent.click(enableSwitch);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(storage.getStoredSettings().disabled).toBe(false);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("saves the next interval edit after an unrelated unconfirmed snapshot", async () => {
    const storage = new InMemorySettingsStorage({ timeInterval: 650 });
    storage.failNextRead(new Error("unavailable"));
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    act(() => storage.emitExternalChange({ theme: "dark" }));
    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "700" } });
    input.blur();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(storage.getStoredSettings().timeInterval).toBe(700);
  });

  it("saves the next interval edit after another setting changes", async () => {
    const { settings, storage } = renderPopup();
    await act(() => settings.whenReady());

    fireEvent.click(screen.getByRole("switch", { name: "Enable extension" }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "700" } });
    input.blur();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(storage.getStoredSettings().timeInterval).toBe(700);
  });

  it("saves the next valid edit after preserving a legacy interval", async () => {
    const storage = new InMemorySettingsStorage({ timeInterval: "1500" });
    const settings = createExtensionSettings(storage);
    render(<PopupApp settings={settings} />);
    await act(() => settings.whenReady());

    fireEvent.click(screen.getByRole("switch", { name: "Enable extension" }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "800" } });
    input.blur();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(storage.getStoredSettings().timeInterval).toBe(800);
  });

  it("does not add a saving message that changes the popup height", async () => {
    const { settings, storage } = renderPopup();
    await act(() => settings.whenReady());
    vi.spyOn(storage, "write").mockImplementationOnce(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole("switch", { name: "Enable extension" }));
    expect(screen.getByRole("switch")).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
  });

  it("links to the project repository in a new tab", async () => {
    const { settings } = renderPopup();
    await act(() => settings.whenReady());
    const link = screen.getByRole("link", { name: "View Double Middle-Click on GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/chenghsj/DbClickCloseTab");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
