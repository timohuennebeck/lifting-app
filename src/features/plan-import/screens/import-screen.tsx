import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { StepTitle } from '@/features/plan-create/components/step-title';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';

import { FileTypesArt, SourceCard, ViewfinderArt } from '../components/source-card';
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
    <Screen scroll header={<StepHeader step={1} total={IMPORT_STEPS} />}>
      <StepTitle title={t('index.title')} subtitle={t('index.subtitle')} className="pt-3.5" />
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
          <FileTypesArt />
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
    </Screen>
  );
}
