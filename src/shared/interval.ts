export const DEFAULT_INTERVAL = 400;
export const MIN_INTERVAL = 100;
export const MAX_INTERVAL = 1000;

export function parseInterval(value: unknown): number | null {
  const interval = Number(value);

  if (
    !Number.isInteger(interval) ||
    interval < MIN_INTERVAL ||
    interval > MAX_INTERVAL
  ) {
    return null;
  }

  return interval;
}

export function parseStoredInterval(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }
  if (typeof value === "string" && value.trim() === "") return null;

  const interval = Number(value);
  return Number.isFinite(interval) && interval > 0 ? interval : null;
}

export function normalizeInterval(value: unknown): number {
  return parseStoredInterval(value) ?? DEFAULT_INTERVAL;
}
