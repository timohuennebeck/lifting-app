import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { fileExtension, formatFileSize, IMPORT_STEPS } from '../lib/format';
import { pickPlanFile } from '../lib/pick-source';
import { useImportStore } from '../stores/import-store';

const LINES = [
  { w: '60%', ink: true },
  { w: '90%' },
  { w: '75%' },
  { w: '85%' },
  { gap: true },
  { w: '50%', ink: true },
  { w: '80%' },
  { w: '65%' },
  { w: '88%' },
  { w: '70%' },
] as const;

/** 05 · OK D2: preview of the uploaded file with "Swap" before reading it. */
export function OptionsScreen() {
  const { t } = useTranslation('planImport');
  const source = useImportStore((s) => s.source);
  const setFile = useImportStore((s) => s.setFile);
  if (source?.kind !== 'file') return <Redirect href="/import" />;
  const { file } = source;
  const isImage = file.mimeType?.startsWith('image/');

  async function swap() {
    try {
      const next = await pickPlanFile();
      if (next) setFile(next);
    } catch {
      Alert.alert(t('errors.file'));
    }
  }

  return (
    <StepScreen
      step={2}
      total={IMPORT_STEPS}
      title={t('options.title')}
      footer={<Button label={t('options.cta')} onPress={() => router.push('/import/analysis')} />}
    >
      <View className="flex-1 items-center justify-center gap-5.5 px-5">
        <View
          accessibilityLabel={t('options.preview')}
          className="h-61 w-47 overflow-hidden rounded-2xl bg-paper"
          style={{ boxShadow: '0 24px 50px rgba(0,0,0,0.5)' }}
        >
          {isImage ? (
            <Image source={{ uri: file.uri }} contentFit="cover" style={{ flex: 1 }} />
          ) : (
            <View className="flex-1 gap-2.25 px-4.5 py-5">
              <View className="mb-2 self-start rounded-md bg-ink px-2 py-1.25">
                <Text className="font-inter-semibold text-xs leading-3 tracking-[0.5px] text-paper">
                  {fileExtension(file.name, file.mimeType)}
                </Text>
              </View>
              {LINES.map((line, i) =>
                'gap' in line ? (
                  <View key={i} className="h-2" />
                ) : (
                  <View
                    key={i}
                    className={
                      'ink' in line
                        ? 'h-1.75 rounded-[3px] bg-ink'
                        : 'h-1.25 rounded-[3px] bg-[#C9C3B6]'
                    }
                    style={{ width: line.w }}
                  />
                ),
              )}
            </View>
          )}
        </View>
        <View className="max-w-full items-center gap-1">
          <Text variant="bodyStrong" numberOfLines={1} className="max-w-75">
            {file.name}
          </Text>
          {file.size ? (
            <Text variant="caption" tone="subtle" className="font-inter">
              {formatFileSize(file.size)}
            </Text>
          ) : null}
        </View>
        <PressableScale
          haptic="select"
          onPress={swap}
          className="h-9 justify-center rounded-full bg-elevated px-4"
        >
          <Text variant="caption" className="text-sm">
            {t('options.swap')}
          </Text>
        </PressableScale>
      </View>
    </StepScreen>
  );
}
