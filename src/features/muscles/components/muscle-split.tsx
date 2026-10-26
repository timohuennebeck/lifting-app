import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { MuscleShare } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { MuscleTileList } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

interface MuscleGroupProps {
  label: string;
  shares: MuscleShare[];
  primary: boolean;
}

/** "PRIMÄR ②" over its chips (at most three, then "+N"); primary in neon, secondary in grey. */
function MuscleGroup({ label, shares, primary }: MuscleGroupProps) {
  return (
    <View className="gap-3.5">
      <View className="flex-row items-center gap-2" accessibilityRole="header">
        <Text variant="overline" tone={primary ? 'accent' : 'subtle'}>
          {label}
        </Text>
        <View
          className={cn(
            'size-5 items-center justify-center rounded-full',
            primary ? 'bg-accent' : 'bg-control',
          )}
        >
          <Text
            variant="caption"
            tone={primary ? 'onAccent' : 'muted'}
            className="font-inter-bold text-xs leading-4"
          >
            {shares.length}
          </Text>
        </View>
      </View>
      {/* Side by side where they fit, the next line where they don't; past three, "+N". */}
      <MuscleTileList shares={shares} highlight={primary} className="flex-row flex-wrap gap-2.5" />
    </View>
  );
}

export interface MuscleSplitProps {
  primary: MuscleShare[];
  secondary: MuscleShare[];
  className?: string;
}

/** A workout's muscles as "Primär" and "Sekundär" groups of chips (summary, breakdown). */
export function MuscleSplit({ primary, secondary, className }: MuscleSplitProps) {
  const { t } = useTranslation('muscles');
  return (
    <View className={cn('gap-6', className)}>
      {primary.length ? (
        <MuscleGroup label={t('breakdown.primary')} shares={primary} primary />
      ) : null}
      {secondary.length ? (
        <MuscleGroup label={t('breakdown.secondary')} shares={secondary} primary={false} />
      ) : null}
    </View>
  );
}
