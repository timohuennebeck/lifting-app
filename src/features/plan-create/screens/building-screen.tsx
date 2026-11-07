import { Stack } from 'expo-router';
import { type ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanRun } from '@/features/plan-import/hooks/use-plan-run';
import { groupOfMuscle } from '@/shared/data/muscle-groups';
import { useNow } from '@/shared/hooks/use-now';
import { Text } from '@/shared/ui/text';

import { BarbellLoad, REP_SECONDS } from '../components/building/barbell-load';
import type { BuildingVariantProps } from '../components/building/motion';
import { SlotReels } from '../components/building/slot-reels';
import { SparkCloud } from '../components/building/spark-cloud';
import { TipCards } from '../components/building/tip-cards';
import { WritingPage } from '../components/building/writing-page';
import { answersFromDraft } from '../lib/plan-answers';

/** Seconds each line of what is being done stays; the last one stays until the plan is there. */
const LINE_SECONDS = 3;

/** What a variant needs besides the common props. */
interface Extras {
  lifts: readonly string[];
  rep: string;
  title: string;
  tips: readonly string[];
}

/** The five takes on the wait; the first is shown, the others can be tried in a dev build. */
const VARIANTS: { name: string; Component: ComponentType<BuildingVariantProps & Extras> }[] = [
  { name: 'Sparks', Component: SparkCloud },
  { name: 'Slot reels', Component: SlotReels },
  { name: 'Barbell', Component: BarbellLoad },
  { name: 'Writing', Component: WritingPage },
  { name: 'Tips', Component: TipCards },
];

/**
 * 00·P1: the AI makes the plan from the answers (generate-plan) behind an animation; the editor
 * opens with its first exercise and the rest fills in there (ConfirmScreen), the name comes after.
 * How long the first exercise takes isn't known, so the screen shows the time waited, not a share.
 */
export function BuildingScreen() {
  const { t } = useTranslation(['planCreate', 'exercises']);
  const insets = useSafeAreaInsets();
  const draft = useDraft();
  // The answers as the screen opened; a new draft object doesn't start another plan.
  const [input] = useState(() => answersFromDraft(draft));
  usePlanRun(input);
  const [startedAt] = useState(Date.now);
  const now = useNow(1000);
  const [variant, setVariant] = useState(0);

  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const lines = t('planCreate:building.lines', { returnObjects: true });
  const areas = [...new Set(input.focus.map(groupOfMuscle))].map((g) => t(`exercises:groups.${g}`));
  const routines = Math.max(1, Math.min(input.sessionsPerWeek, 6));

  const props: BuildingVariantProps & Extras = {
    seconds,
    line: lines[Math.min(lines.length - 1, Math.floor(seconds / LINE_SECONDS))],
    elapsed: t('planCreate:building.elapsed', { count: seconds }),
    chips: [
      t(`planCreate:goalShort.${input.goal}`),
      t('planCreate:building.frequency', {
        count: input.sessionsPerWeek,
        minutes: input.sessionMinutes,
      }),
      t(`planCreate:equipmentShort.${input.equipment}`),
      areas.length
        ? t('planCreate:building.focus', { areas: areas.join(', ') })
        : t('planCreate:building.balanced'),
    ],
    tags: Array.from({ length: routines }, (_, i) =>
      t('planCreate:building.routineTag', { n: i + 1 }),
    ),
    lifts: t('planCreate:building.lifts', { returnObjects: true }),
    rep: t('planCreate:building.rep', { n: Math.floor(seconds / REP_SECONDS) + 1 }),
    title: t('planCreate:building.tipsTitle'),
    tips: t('planCreate:building.tips', { returnObjects: true }),
  };
  const { Component, name } = VARIANTS[variant];

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <View className="flex-1 overflow-hidden bg-bg">
        <Component {...props} />
        {/* Dev builds only: tap to try the next variant. */}
        {__DEV__ ? (
          <Pressable
            onPress={() => setVariant((v) => (v + 1) % VARIANTS.length)}
            className="absolute self-center rounded-full bg-control px-3 py-1.5"
            style={{ top: insets.top + 8 }}
          >
            <Text variant="caption">{`${variant + 1}/${VARIANTS.length} ${name} ›`}</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
