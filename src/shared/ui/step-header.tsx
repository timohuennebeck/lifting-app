import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconButton } from './icon-button';
import { ProgressBar } from './progress-bar';
import { Text } from './text';

export interface StepHeaderProps {
  step: number;
  total: number;
  /** Hides the back button, e.g. on the first step of a phase. */
  hideBack?: boolean;
}

/** Back button, phase progress bar and "x of y" counter used by step flows. */
export function StepHeader({ step, total, hideBack }: StepHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-3.5 py-1.5 pr-5 pl-4">
      {hideBack ? (
        <View className="size-10.5" />
      ) : (
        <IconButton
          icon="chevron-left"
          iconSize={7}
          accessibilityLabel={t('actions.back')}
          onPress={() => router.back()}
        />
      )}
      <ProgressBar value={step / total} />
      <Text variant="caption" tone="subtle">
        {t('progress.stepOf', { current: step, total })}
      </Text>
    </View>
  );
}
