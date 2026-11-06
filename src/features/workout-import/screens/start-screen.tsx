import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ABOUT_STEPS } from '@/features/onboarding/lib/flow';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { FileCards } from '../components/file-art';
import { chooseImportFile, type ImportFile, type ReadFile } from '../lib/read-file';
import { useWorkoutImportStore } from '../stores/workout-import-store';
import { afterPick, CTA_STYLE, flowSteps, LINK_STYLE, TITLE_STYLE } from '../lib/steps';

const LOGOS = [
  require('@/assets/images/import/hevy.png'),
  require('@/assets/images/import/strong.png'),
] as const;

/**
 * 13ia: the plan flow's first step. A workout app's export or any spreadsheet to import, or
 * "Ich starte neu" to have a plan made.
 */
export function StartScreen() {
  const { t } = useTranslation('workoutImport');
  const { inApp, step } = usePlanFlow();
  const setFile = useWorkoutImportStore((s) => s.setFile);

  function open(file: ImportFile, read: ReadFile) {
    setFile(file, read);
    router.push(step(afterPick(read)));
  }
  const choose = () => void chooseImportFile(open);

  return (
    <StepScreen
      {...TITLE_STYLE}
      // The last question about the user in onboarding; in the app the import's first step.
      {...(inApp
        ? { step: 1, total: flowSteps(null, true).total }
        : { step: ABOUT_STEPS, total: ABOUT_STEPS })}
      title={t('start.title')}
      subtitle={t('start.subtitle')}
      footer={
        <View className="gap-1">
          <Button {...CTA_STYLE} label={t('start.cta')} onPress={choose} />
          <TextButton
            {...LINK_STYLE}
            label={t('start.fresh')}
            onPress={() => router.push(step('/create/goal'))}
          />
        </View>
      }
    >
      <PressableScale
        haptic="select"
        activeScale={0.985}
        onPress={choose}
        accessibilityRole="button"
        accessibilityLabel={t('start.pick')}
        className="flex-1 items-center justify-center gap-7 px-4 pt-5.5 pb-5"
      >
        <FileCards labels={['TSV', 'CSV', 'XLSX']} />
        <View className="items-center gap-1">
          <Text className="font-inter-semibold text-base text-fg">{t('start.pick')}</Text>
          <Text className="text-center font-inter text-sm leading-5 text-subtle">
            {t('start.hint')}
          </Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <View className="flex-row gap-1.5">
            {LOGOS.map((logo, i) => (
              <Image key={i} source={logo} style={{ width: 26, height: 26, borderRadius: 6 }} />
            ))}
          </View>
          <Text className="font-inter-medium text-[13px] text-subtle">{t('start.more')}</Text>
        </View>
      </PressableScale>
    </StepScreen>
  );
}
