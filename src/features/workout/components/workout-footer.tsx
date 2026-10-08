import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
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
  const footerInset = useFooterInset();
  return (
    <View
      className="flex-row items-center gap-2.5 bg-bg px-4 pt-3"
      style={{ paddingBottom: footerInset }}
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
