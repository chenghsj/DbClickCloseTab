import { Switch } from "@/components/ui/switch";
import { t } from "@/shared/i18n";
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
            {t("enableExtension")}
          </label>
          {compact ? null : (
            <p
              id="enable-help"
              className="mt-0.5 text-xs leading-snug text-muted-foreground"
            >
              {t("enableHelp")}
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
          {t("enableError")}
        </p>
      ) : null}
    </div>
  );
}
