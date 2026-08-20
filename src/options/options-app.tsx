import { BrandHeader } from "@/components/brand-header";
import { ExtensionEnabledField } from "@/components/extension-enabled-field";
import { GitHubLink } from "@/components/github-link";
import { IntervalSettingField } from "@/components/interval-setting-field";
import { ThemeSettingField } from "@/components/theme-setting-field";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoSaveInterval } from "@/options/use-auto-save-interval";
import { useExtensionEnabledSetting } from "@/options/use-extension-enabled-setting";
import { useThemeSetting } from "@/options/use-theme-setting";
import type { ExtensionSettingsModule } from "@/shared/extension-settings";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";

interface OptionsAppProps {
  settings?: ExtensionSettingsModule;
}

export function OptionsApp({ settings: providedSettings }: OptionsAppProps = {}) {
  const settings = providedSettings ?? getRuntimeExtensionSettings();
  const { commitDraft, draft, loaded, saveState, setDraft, writeInFlight } =
    useAutoSaveInterval({ settings });
  const extensionEnabledSetting = useExtensionEnabledSetting(settings);
  const themeSetting = useThemeSetting(settings);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <BrandHeader
          title="Double Middle-Click"
          subtitle="Customize behavior, appearance, and double-click timing."
        />

        <Card size="sm">
          <CardContent>
            <ExtensionEnabledField {...extensionEnabledSetting} />
            <div className="my-3 border-t" />
            <ThemeSettingField {...themeSetting} />
            <div className="my-3 border-t" />
            <IntervalSettingField
              commitDraft={commitDraft}
              draft={draft}
              loaded={loaded}
              saveState={saveState}
              setDraft={setDraft}
              writeInFlight={writeInFlight}
            />
          </CardContent>
        </Card>

        <GitHubLink className="self-center" />
      </div>
    </main>
  );
}
