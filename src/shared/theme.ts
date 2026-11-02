export const THEMES = ["auto", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export type ResolvedTheme = Exclude<Theme, "auto">;

export const DEFAULT_THEME: Theme = "auto";

export function normalizeTheme(value: unknown): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : DEFAULT_THEME;
}

export function prefersDarkTheme(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  return theme === "auto" ? (prefersDark ? "dark" : "light") : theme;
}

export function applyTheme(theme: Theme): void {
  const resolvedTheme = resolveTheme(theme, prefersDarkTheme());

  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}
