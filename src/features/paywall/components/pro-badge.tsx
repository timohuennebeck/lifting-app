import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

export interface ProBadgeProps {
  className?: string;
}

/** "FORGE PRO" pill from the profile header; render it when `useIsPro()` is true. */
export function ProBadge({ className }: ProBadgeProps) {
  const { t } = useTranslation('paywall');
  return (
    <View className={cn('self-start rounded-full bg-accent/16 px-3 py-1.5', className)}>
      <Text variant="caption" tone="accent" className="text-[11px] leading-3.25 tracking-[1.3px]">
        {t('badge')}
      </Text>
    </View>
  );
}
