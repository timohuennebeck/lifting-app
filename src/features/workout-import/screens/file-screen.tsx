import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { formatNumber } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { PickedFile } from '../components/file-art';
import { chooseImportFile } from '../lib/read-file';
import { asksSheets, CTA_STYLE, fileLabel, importSteps, TITLE_STYLE } from '../lib/steps';
import { useWorkoutImportStore } from '../stores/workout-import-store';

const KB = 1024;
const MB = 1024 * KB;

function formatFileSize(bytes: number) {
  return bytes >= MB
    ? `${formatNumber(bytes / MB, 1)} MB`
    : `${formatNumber(Math.max(1, Math.round(bytes / KB)), 0)} KB`;
}

/** 13l: the picked file with "Ersetzen", before its sheets (a workbook) or reading it. */
export function FileScreen() {
  const { t } = useTranslation('workoutImport');
  const { step } = usePlanFlow();
  const file = useWorkoutImportStore((s) => s.file);
  const read = useWorkoutImportStore((s) => s.read);
  const setFile = useWorkoutImportStore((s) => s.setFile);
  if (!file || !read) return <Redirect href={step('/import')} />;

  const sheets = asksSheets(read);
  const size = file.size ? formatFileSize(file.size) : null;
  // A workbook's sheets too: "214 KB · 3 Tabellenblätter".
  const caption =
    read.summaries && size ? t('file.sheets', { size, count: read.summaries.length }) : size;

  return (
    <StepScreen
      {...TITLE_STYLE}
      step={1}
      total={importSteps(read)}
      title={t('file.title')}
      footer={
        <Button
          {...CTA_STYLE}
          label={sheets ? t('file.next') : t('file.read')}
          onPress={() => router.push(step(sheets ? '/import/sheets' : '/import/reading'))}
        />
      }
    >
      <View className="flex-1 items-center justify-center gap-6 px-4 pt-5.5 pb-5">
        <PickedFile label={fileLabel(file.name)} />
        <View className="items-center gap-3.5">
          <View className="items-center gap-1">
            <Text numberOfLines={1} className="max-w-80 font-inter-semibold text-[17px] text-fg">
              {file.name}
            </Text>
            {caption ? (
              <Text className="font-inter text-sm leading-[17px] text-subtle">{caption}</Text>
            ) : null}
          </View>
          <PressableScale
            haptic="select"
            onPress={() => void chooseImportFile(setFile)}
            className="h-9 flex-row items-center gap-2 rounded-full bg-elevated px-4"
          >
            <Icon name="sync" size={14} color={colors.fgMid} />
            <Text className="font-inter-semibold text-sm text-fg-mid">{t('file.replace')}</Text>
          </PressableScale>
        </View>
      </View>
    </StepScreen>
  );
}
