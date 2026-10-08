import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { FormatCards } from '@/shared/ui/format-cards';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { SourceCard, ViewfinderArt } from '../components/source-card';
import { IMPORT_STEPS } from '../lib/format';
import { pickPlanFile } from '../lib/pick-source';
import { useImportStore } from '../stores/import-store';

/** 05: choose how to import a plan (photo or file), or switch to building one. */
export function ImportScreen() {
  const { t } = useTranslation('planImport');
  const setFile = useImportStore((s) => s.setFile);
  const updateDraft = useUpdateDraft();

  async function uploadFile() {
    try {
      const file = await pickPlanFile();
      if (!file) return;
      setFile(file);
      router.push('/import/options');
    } catch {
      Alert.alert(t('errors.file'));
    }
  }

  return (
    <StepScreen
      step={1}
      total={IMPORT_STEPS}
      title={t('index.title')}
      subtitle={t('index.subtitle')}
      subtitleTone="subtle"
      titleClassName="pt-3.5"
      scroll
    >
      <View className="gap-3 px-4 pt-[22px]">
        <SourceCard
          title={t('index.photo.title')}
          description={t('index.photo.description')}
          icon="camera"
          primary
          onPress={() => router.push('/import/camera')}
        >
          <ViewfinderArt />
        </SourceCard>
        <SourceCard
          title={t('index.file.title')}
          description={t('index.file.description')}
          icon="arrow-right"
          onPress={uploadFile}
        >
          <FormatCards shadow={false} className="mt-1" />
        </SourceCard>
      </View>
      <PressableScale
        haptic="select"
        onPress={() => {
          updateDraft({ hasPlan: false });
          router.push('/create/goal');
        }}
        className="items-center px-5 pt-[18px] pb-2"
      >
        <Text variant="caption" tone="subtle" className="font-inter text-sm">
          {`${t('index.noPlan')} `}
          <Text variant="caption" className="text-sm">
            {t('index.createOwn')}
          </Text>
        </Text>
      </PressableScale>
    </StepScreen>
  );
}
