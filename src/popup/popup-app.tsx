import { BrandHeader } from "@/components/brand-header";
import { ExtensionEnabledField } from "@/components/extension-enabled-field";
import { GitHubLink } from "@/components/github-link";
import { IntervalSettingField } from "@/components/interval-setting-field";
import { ThemeSettingField } from "@/components/theme-setting-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoSaveInterval } from "@/options/use-auto-save-interval";
import { useExtensionEnabledSetting } from "@/options/use-extension-enabled-setting";
import { useThemeSetting } from "@/options/use-theme-setting";
import type { ExtensionSettingsModule } from "@/shared/extension-settings";
import { getRuntimeExtensionSettings } from "@/shared/runtime-extension-settings";

interface PopupAppProps {
  settings?: ExtensionSettingsModule;
}

export function PopupApp({ settings: providedSettings }: PopupAppProps = {}) {
  const settings = providedSettings ?? getRuntimeExtensionSettings();
  const { commitDraft, draft, loaded, saveState, setDraft, writeInFlight } =
    useAutoSaveInterval({ settings });
  const extensionEnabledSetting = useExtensionEnabledSetting(settings);
  const themeSetting = useThemeSetting(settings);

  return (
    <main className="w-[22rem] max-w-full bg-background p-2.5 text-foreground">
      <div className="flex w-full flex-col gap-2">
        <BrandHeader
          title="Double Middle-Click"
          titleClassName="text-base"
          iconClassName="size-7"
          className="gap-2 px-1"
        >
          <Badge variant="secondary">
            {extensionEnabledSetting.enabled ? "Ready" : "Paused"}
          </Badge>
        </BrandHeader>

        <Card size="sm" className="mt-1 w-full">
          <CardContent>
            <ExtensionEnabledField {...extensionEnabledSetting} compact />
            <div className="my-3 border-t" />
            <ThemeSettingField {...themeSetting} compact />
            <div className="my-3 border-t" />
            <IntervalSettingField
              compact
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
