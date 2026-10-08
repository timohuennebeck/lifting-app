import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

export interface WorkoutFooterProps {
  label: string;
  onPress: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  loading?: boolean;
}

/** Previous / next exercise and the main action (log set · next exercise · finish). */
export function WorkoutFooter({
  label,
  onPress,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  loading,
}: WorkoutFooterProps) {
  const { t } = useTranslation('workout');
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center gap-2.5 bg-bg px-4 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <IconButton
        icon="chevron-left"
        size={60}
        iconSize={10}
        disabled={!hasPrevious}
        className={cn(!hasPrevious && 'opacity-30')}
        accessibilityLabel={t('nav.previous')}
        onPress={onPrevious}
      />
      <Button label={label} loading={loading} onPress={onPress} className="flex-1" />
      <IconButton
        icon="chevron-right"
        size={60}
        iconSize={10}
        disabled={!hasNext}
        className={cn(!hasNext && 'opacity-30')}
        accessibilityLabel={t('nav.next')}
        onPress={onNext}
      />
    </View>
  );
}
