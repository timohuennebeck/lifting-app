import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { workoutMuscleSplit } from '@/features/exercises/lib/muscle-groups';
import type { MuscleShare } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { MuscleMap, MuscleTile } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { parseWorkoutItems } from '../lib/workout-muscles-link';

interface MuscleGroupProps {
  label: string;
  shares: MuscleShare[];
  primary: boolean;
  className?: string;
}

/** "PRIMÄR ②" over its chips; primary in neon, secondary in grey. */
function MuscleGroup({ label, shares, primary, className }: MuscleGroupProps) {
  return (
    <View className={cn('items-start gap-3.5', className)}>
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
      {/* Side by side where they fit, the next line where they don't. */}
      <View className="flex-row flex-wrap gap-2.5 self-stretch">
        {shares.map((s) => (
          <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} highlight={primary} />
        ))}
      </View>
    </View>
  );
}

/**
 * Behind the ⓘ of "Beanspruchte Muskeln": the workout's muscles on both body views, then split
 * into primary (targeted by at least one exercise) and secondary (only ever helping).
 */
export function WorkoutMusclesScreen() {
  const { title, items } = useLocalSearchParams<{ title?: string; items?: string }>();
  const { t } = useTranslation('muscles');
  const insets = useSafeAreaInsets();
  const { primary, secondary } = workoutMuscleSplit(parseWorkoutItems(items));
  const primaryIds = primary.map((s) => s.muscle);
  const secondaryIds = secondary.map((s) => s.muscle);

  return (
    <Screen header={<ScreenHeader title={title} />}>
      <ScrollView
        contentContainerClassName="px-4 pt-11"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row justify-center gap-4.5"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {(['front', 'back'] as const).map((view) => (
            <MuscleMap
              key={view}
              view={view}
              selected={primaryIds}
              secondary={secondaryIds}
              width={155}
              height={314}
            />
          ))}
        </View>
        {primary.length ? (
          <MuscleGroup label={t('breakdown.primary')} shares={primary} primary className="pt-14" />
        ) : null}
        {secondary.length ? (
          <MuscleGroup
            label={t('breakdown.secondary')}
            shares={secondary}
            primary={false}
            className={primary.length ? 'pt-6' : 'pt-14'}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
