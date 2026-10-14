import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckPhoto } from '@/features/progress-check/components/check-photo';
import { PoseChips } from '@/features/progress-check/components/pose-chips';
import {
  type ProgressCheck,
  useProgressCheckPhotos,
  useProgressChecks,
} from '@/features/progress-check/data/progress-checks';
import type { Pose } from '@/features/progress-check/lib/poses';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';
import { DAY_MS } from '@/shared/lib/date';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { BodyPhotoCard, CompareArrow } from '../components/body-photo-card';
import { comparedPair, inOrder } from '../lib/comparison';
import { useCompareStore } from '../stores/compare-store';

type Side = 'A' | 'B';

/** The scroll view would otherwise take the free height of the screen (seen on web). */
const STRIP_STYLE = { flexGrow: 0, flexShrink: 0 };

interface CheckThumbProps {
  check: ProgressCheck;
  pose: Pose;
  storagePath?: string;
  /** The side this check is compared on, if any. */
  side: Side | null;
  onPress: () => void;
}

/** One check in the strip: its photo of the selected pose, the date, and A or B when it's used. */
function CheckThumb({ check, pose, storagePath, side, onPress }: CheckThumbProps) {
  const date = formatShortDate(check.createdAt);
  return (
    <PressableScale
      haptic="select"
      accessibilityLabel={`${date}, ${check.score}`}
      accessibilityState={{ selected: !!side }}
      onPress={onPress}
      className="w-17 items-center gap-1.5"
    >
      <View
        className={cn(
          'h-21.5 w-17 overflow-hidden rounded-xl bg-surface',
          side === 'A' && 'border-2 border-fg',
          side === 'B' && 'border-2 border-accent',
          !side && 'opacity-60',
        )}
      >
        <CheckPhoto checkId={check.id} pose={pose} storagePath={storagePath} />
        {side ? (
          <View
            className={cn(
              'absolute top-1 right-1 size-5 items-center justify-center rounded-full',
              side === 'A' ? 'bg-fg' : 'bg-accent',
            )}
          >
            <Text variant="caption" tone="onAccent" className="font-inter-bold text-[11px]">
              {side}
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="caption" tone={side ? 'default' : 'subtle'} className="text-xs">
        {date}
      </Text>
    </PressableScale>
  );
}

/**
 * Vergleichen: pick the before (A) and after (B) checks the Körper tab compares. Tap a card to
 * choose which side to pick, then a check in the strip. "Fertig" saves the pair; back drops it.
 */
export function CompareScreen() {
  const { side } = useLocalSearchParams<{ side?: string }>();
  const { t } = useTranslation(['body', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const { data: checks = [] } = useProgressChecks();
  const { data: photos = {} } = useProgressCheckPhotos();
  const saved = useCompareStore();
  const [active, setActive] = useState<Side>(side === 'b' ? 'B' : 'A');
  const [pose, setPose] = useState<Pose>('front');
  const [picked, setPicked] = useState<{ beforeId: string; afterId: string } | null>(null);

  const byId = (id: string | undefined) => checks.find((c) => c.id === id);
  const start = comparedPair(checks, saved);
  const before = byId(picked?.beforeId) ?? start?.before;
  const after = byId(picked?.afterId) ?? start?.after;
  const header = <ScreenHeader title={t('compare.title')} />;
  if (!before || !after) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        {header}
      </View>
    );
  }

  const numberOf = (check: ProgressCheck) => checks.indexOf(check) + 1;
  const sideOf = (check: ProgressCheck): Side | null =>
    check.id === before.id ? 'A' : check.id === after.id ? 'B' : null;
  const days = Math.round((Date.parse(after.createdAt) - Date.parse(before.createdAt)) / DAY_MS);

  const choose = (check: ProgressCheck) => {
    if (sideOf(check)) return;
    // Before always comes first in time: picking past the other side swaps them.
    const pair = active === 'A' ? inOrder(check, after) : inOrder(before, check);
    setPicked({ beforeId: pair.before.id, afterId: pair.after.id });
  };

  const done = () => {
    useCompareStore.getState().save(before.id, after.id, checks[checks.length - 1].id);
    router.back();
  };

  const card = (check: ProgressCheck, cardSide: Side) => (
    <BodyPhotoCard
      checkId={check.id}
      pose={pose}
      storagePath={photos[check.id]?.[pose]}
      label={t('checkLabel', { n: numberOf(check), date: formatShortDate(check.createdAt) })}
      score={check.score}
      badge={cardSide}
      after={cardSide === 'B'}
      selected={active === cardSide}
      faded={active !== cardSide}
      onPress={() => setActive(cardSide)}
    />
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      {header}
      {/* No padding on the row itself: the arrow is centred on its width. */}
      <View className="px-4 pt-3.5">
        <View className="flex-row gap-2.5">
          {card(before, 'A')}
          {card(after, 'B')}
          <CompareArrow />
        </View>
      </View>

      <PoseChips pose={pose} onChange={setPose} className="px-4 pt-3.5" />

      <View className="flex-row items-baseline justify-between gap-3 px-5 pt-7 pb-3">
        <Text variant="overline" tone="subtle" className="text-xs">
          {t('compare.pickFor', { side: active })}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter text-xs">
          {t('compare.daysBetween', { count: days })}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={STRIP_STYLE}
        contentContainerClassName="gap-2.5 px-4"
      >
        {checks.map((check) => (
          <CheckThumb
            key={check.id}
            check={check}
            pose={pose}
            storagePath={photos[check.id]?.[pose]}
            side={sideOf(check)}
            onPress={() => choose(check)}
          />
        ))}
      </ScrollView>

      <View className="mt-auto px-4 pt-4" style={{ paddingBottom: footerInset }}>
        <Button label={t('common:actions.done')} onPress={done} />
      </View>
    </View>
  );
}
