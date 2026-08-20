export const DEFAULT_DISABLED = false;

export function normalizeDisabled(value: unknown): boolean {
  return value === true;
}
