import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { newId } from '@/shared/data/json';
import { FormatCards } from '@/shared/ui/format-cards';
import { CameraAccessSheet, useCameraAccess } from '@/shared/ui/camera/camera-access-sheet';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { SourceCard, ViewfinderArt } from '../components/source-card';
import { choosePlanFile } from '../lib/pick-source';
import { IMPORT_STEPS } from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

/** 05: choose how to import a plan (photo or file), or build one exercise by exercise. */
export function ImportScreen() {
  const { t } = useTranslation('planImport');
  const { step } = usePlanFlow();
  const camera = useCameraAccess(() => router.push(step('/import/camera')));
  const setFile = useImportStore((s) => s.setFile);
  const setPlan = useImportStore((s) => s.setPlan);

  // No plan at hand: the same editor an import ends in, starting with one empty routine.
  function buildOwn() {
    setPlan({
      name: t('index.ownPlan'),
      routines: [{ key: newId(), name: t('confirm.newRoutine', { number: 1 }), exercises: [] }],
      newExercises: [],
    });
    router.push(step('/import/confirm'));
  }

  const uploadFile = () =>
    choosePlanFile((file) => {
      setFile(file);
      router.push(step('/import/options'));
    });

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
      <View className="gap-3 px-4 pt-5.5">
        <SourceCard
          title={t('index.photo.title')}
          description={t('index.photo.description')}
          icon="camera"
          primary
          onPress={camera.request}
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
      <PressableScale haptic="select" onPress={buildOwn} className="items-center px-5 pt-4.5 pb-2">
        <Text variant="caption" tone="subtle" className="font-inter text-sm">
          {`${t('index.noPlan')} `}
          <Text variant="caption" className="text-sm">
            {t('index.createOwn')}
          </Text>
        </Text>
      </PressableScale>
      <CameraAccessSheet {...camera.sheet} body={t('camera.access')} />
    </StepScreen>
  );
}
