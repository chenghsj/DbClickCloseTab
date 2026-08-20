import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MAX_INTERVAL,
  MIN_INTERVAL,
  parseInterval,
} from "@/shared/interval";
import type { IntervalSaveState } from "@/shared/settings-state";

const DRAG_PIXELS_PER_STEP = 8;
const DRAG_INTERVAL_STEP = 10;

function clampInterval(interval: number): number {
  return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, interval));
}

const saveMessages: Record<IntervalSaveState, string> = {
  loading: "Loading setting…",
  saving: "Saving…",
  saved: "Saved",
  invalid: `Enter a whole number from ${MIN_INTERVAL} to ${MAX_INTERVAL}.`,
  "load-error": "Couldn’t load the saved interval. Enter a value to try again.",
  "save-error": "Couldn’t save. Change the value to try again.",
};

interface DragState {
  currentInterval: number;
  pointerId: number;
  startX: number;
  startInterval: number;
  steps: number;
}

interface IntervalSettingFieldProps {
  commitDraft: (value?: string) => void;
  compact?: boolean;
  draft: string;
  loaded: boolean;
  saveState: IntervalSaveState;
  setDraft: (value: string) => void;
  writeInFlight: boolean;
}

export function IntervalSettingField({
  commitDraft,
  compact = false,
  draft,
  loaded,
  saveState,
  setDraft,
  writeInFlight,
}: IntervalSettingFieldProps) {
  const dragState = useRef<DragState | null>(null);
  const [dragDraft, setDragDraft] = useState<string | null>(null);
  const invalid = loaded && parseInterval(draft) === null;
  const isError = ["invalid", "load-error", "save-error"].includes(saveState);

  function handlePointerDown(event: PointerEvent<HTMLLabelElement>) {
    if (event.button !== 0 || writeInFlight) return;

    const interval = parseInterval(draft);
    if (interval === null) return;

    dragState.current = {
      currentInterval: interval,
      pointerId: event.pointerId,
      startX: event.clientX,
      startInterval: interval,
      steps: 0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLLabelElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const steps = Math.trunc(
      (event.clientX - drag.startX) / DRAG_PIXELS_PER_STEP,
    );
    if (steps === drag.steps) return;

    drag.steps = steps;
    const nextInterval = clampInterval(
      drag.startInterval + steps * DRAG_INTERVAL_STEP,
    );
    drag.currentInterval = nextInterval;
    setDragDraft(String(nextInterval));
  }

  function clearDrag(
    event: PointerEvent<HTMLLabelElement>,
  ): DragState | null {
    const drag = dragState.current;
    if (drag?.pointerId !== event.pointerId) return null;
    if (
      !event.currentTarget.hasPointerCapture ||
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    dragState.current = null;
    setDragDraft(null);
    return drag;
  }

  function handlePointerUp(event: PointerEvent<HTMLLabelElement>) {
    const drag = clearDrag(event);
    if (!drag) return;
    if (String(drag.currentInterval) !== draft) {
      const value = String(drag.currentInterval);
      setDraft(value);
      commitDraft(value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") event.currentTarget.blur();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor="time-interval"
            title="Drag left or right to adjust"
            aria-disabled={writeInFlight}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={clearDrag}
            className={cn(
              "touch-pan-y select-none whitespace-nowrap text-sm font-semibold text-card-foreground",
              writeInFlight ? "cursor-wait" : "cursor-ew-resize",
            )}
          >
            Double-click interval
          </label>
          {compact ? null : (
            <p
              id="interval-help"
              className="mt-0.5 text-xs leading-snug text-muted-foreground"
            >
              {MIN_INTERVAL}–{MAX_INTERVAL} ms · Drag label to adjust.
            </p>
          )}
        </div>
        <div
          data-slot="input-with-suffix"
          className="flex h-8 w-32 shrink-0 items-center overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-colors hover:border-ring focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[input:disabled]:cursor-wait has-[input:disabled]:bg-input/50 has-[input:disabled]:opacity-50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-3 has-[input[aria-invalid=true]]:ring-destructive/20 dark:bg-input/30 dark:has-[input:disabled]:bg-input/80 dark:has-[input[aria-invalid=true]]:border-destructive/50 dark:has-[input[aria-invalid=true]]:ring-destructive/40 motion-reduce:transition-none"
        >
          <Input
            id="time-interval"
            name="timeInterval"
            type="number"
            value={dragDraft ?? draft}
            min={MIN_INTERVAL}
            max={MAX_INTERVAL}
            step="1"
            inputMode="numeric"
            disabled={!loaded || writeInFlight}
            aria-describedby={
              isError
                ? compact
                  ? "save-status"
                  : "interval-help save-status"
                : compact
                  ? undefined
                  : "interval-help"
            }
            aria-invalid={invalid}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => commitDraft()}
            onKeyDown={handleKeyDown}
            onWheel={(event) => event.currentTarget.blur()}
            className="h-full w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-0 text-sm tabular-nums shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-wait disabled:bg-transparent disabled:opacity-100 aria-invalid:border-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent dark:aria-invalid:border-transparent dark:aria-invalid:ring-0 motion-reduce:transition-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none shrink-0 pr-2.5 text-sm text-muted-foreground"
          >
            ms
          </span>
        </div>
      </div>
      {isError ? (
        <p
          id="save-status"
          role="alert"
          aria-live="polite"
          className="mt-2 text-sm font-medium text-destructive"
        >
          {saveMessages[saveState]}
        </p>
      ) : null}
    </div>
  );
}
