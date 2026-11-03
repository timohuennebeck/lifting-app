import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CoachMark } from '@/shared/ui/coach-mark';
import { Text } from '@/shared/ui/text';

/** The coach at work, until the first words of its answer take this place. */
export function AnswerThinking() {
  const { t } = useTranslation('coach');
  return (
    <View className="flex-row items-center gap-2.5">
      <CoachMark animation="think" />
      <Text className="font-inter-semibold text-label leading-[22.5px] text-subtle">
        {t('thinking')}
      </Text>
    </View>
  );
}
