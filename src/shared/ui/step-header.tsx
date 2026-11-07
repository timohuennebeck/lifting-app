import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconButton } from './icon-button';
import { ProgressBar } from './progress-bar';
import { Text } from './text';

export interface StepHeaderProps {
  /** Left out where the screen opens on its own, outside the flow it is a step of. */
  step?: number;
  total?: number;
  /** A close cross in place of the back chevron, for steps that can't go back (after sign-up). */
  onClose?: () => void;
}

/** Back button, phase progress bar and "x of y" counter used by step flows. */
export function StepHeader({ step, total, onClose }: StepHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-3.5 py-1.5 pr-5 pl-4">
      <IconButton
        icon={onClose ? 'close' : 'chevron-left'}
        accessibilityLabel={t(onClose ? 'actions.close' : 'actions.back')}
        onPress={onClose ?? (() => router.back())}
      />
      {step && total ? (
        <>
          <ProgressBar value={step / total} />
          <Text variant="caption" tone="subtle">
            {t('progress.stepOf', { current: step, total })}
          </Text>
        </>
      ) : null}
    </View>
  );
}
