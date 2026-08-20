import { Switch } from "@/components/ui/switch";
import type { ExtensionSaveState } from "@/shared/settings-state";

interface ExtensionEnabledFieldProps {
  compact?: boolean;
  enabled: boolean;
  loaded: boolean;
  saveState: ExtensionSaveState;
  setEnabled: (value: boolean) => void;
}

export function ExtensionEnabledField({
  compact = false,
  enabled,
  loaded,
  saveState,
  setEnabled,
}: ExtensionEnabledFieldProps) {
  const saving = saveState === "saving";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor="enable-extension"
            className="text-sm font-semibold text-card-foreground"
          >
            Enable extension
          </label>
          {compact ? null : (
            <p
              id="enable-help"
              className="mt-0.5 text-xs leading-snug text-muted-foreground"
            >
              Allow double middle-click to close tabs.
            </p>
          )}
        </div>
        <Switch
          id="enable-extension"
          checked={enabled}
          disabled={!loaded || saving}
          aria-describedby={compact ? undefined : "enable-help"}
          onCheckedChange={setEnabled}
        />
      </div>
      {saveState === "error" ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-2 text-xs font-medium text-destructive"
        >
          Couldn’t update the extension state. Try again.
        </p>
      ) : null}
    </div>
  );
}
