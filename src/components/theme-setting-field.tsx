import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExtensionSaveState } from "@/shared/settings-state";
import { normalizeTheme, type Theme } from "@/shared/theme";

const themeLabels: Record<Theme, string> = {
  auto: "Automatic",
  light: "Light",
  dark: "Dark",
};

interface ThemeSettingFieldProps {
  compact?: boolean;
  loaded: boolean;
  saveState: ExtensionSaveState;
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

export function ThemeSettingField({
  compact = false,
  loaded,
  saveState,
  setTheme,
  theme,
}: ThemeSettingFieldProps) {
  const saving = saveState === "saving";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <label
            id="theme-label"
            className="text-sm font-semibold text-card-foreground"
          >
            Theme
          </label>
          {compact ? null : (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Follow your system or choose a fixed appearance.
            </p>
          )}
        </div>
        <Select
          value={theme}
          disabled={!loaded || saving}
          onValueChange={(value) => setTheme(normalizeTheme(value))}
        >
          <SelectTrigger aria-labelledby="theme-label" className="w-32 shrink-0">
            <SelectValue>{themeLabels[theme]}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="auto">Automatic</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {saveState === "error" ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-2 text-xs font-medium text-destructive"
        >
          Couldn’t save the theme. Try again.
        </p>
      ) : null}
    </div>
  );
}
