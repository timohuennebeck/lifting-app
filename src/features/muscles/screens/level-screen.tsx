import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TabScreen } from '@/shared/components/tab-screen';
import { DAY_MS } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { BodyMaps, MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map';

import { LevelCard } from '../components/level-card';
import { RankCard } from '../components/rank-card';
import { useMuscleLevels } from '../hooks/use-muscle-levels';
import { MAIN_MUSCLES, type MuscleLevel, overallLevel, RARE_MUSCLES } from '../lib/levels';
import { useLevelSeenStore } from '../stores/level-seen-store';

const WEEK_MS = 7 * DAY_MS;

const floors = (levels: ReadonlyMap<MuscleId, MuscleLevel>) =>
  Object.fromEntries([...levels].map(([m, l]) => [m, Math.floor(l.value)]));

/**
 * Level tab: every muscle's level from the best lifts, the overall level of the main muscles,
 * and cards with what changed (30-day gains, new levels since last time), pauses and muscles
 * without a level yet.
 */
export function LevelScreen() {
  const { t } = useTranslation('muscles');
  const { levels, before, pauseSince, end, isLoading } = useMuscleLevels();

  // Levels seen when the tab was last left: higher ones now get "Neu". Saved when leaving.
  const [seen, setSeen] = useState(() => useLevelSeenStore.getState().levels);
  const latest = useRef(levels);
  useEffect(() => {
    latest.current = levels;
  }, [levels]);
  useFocusEffect(
    useCallback(() => {
      setSeen(useLevelSeenStore.getState().levels);
      return () => {
        if (latest.current.size) useLevelSeenStore.getState().save(floors(latest.current));
      };
    }, []),
  );
  const hasSeen = Object.keys(seen).length > 0;

  const trained = [...levels.keys()];

  const shown = MUSCLE_IDS.filter((m) => levels.has(m) || !RARE_MUSCLES.has(m)).sort((a, b) => {
    const la = levels.get(a)?.value;
    const lb = levels.get(b)?.value;
    if (la !== undefined || lb !== undefined) return (lb ?? -1) - (la ?? -1);
    // Without a level: the main muscles first, the bigger ones before.
    return (MAIN_MUSCLES[b] ?? 0) - (MAIN_MUSCLES[a] ?? 0);
  });
  const rows = Array.from({ length: Math.ceil(shown.length / 2) }, (_, i) =>
    shown.slice(i * 2, i * 2 + 2),
  );

  const openRanks = () => router.push('/ranks');

  const cardProps = (muscle: MuscleId) => {
    const level = levels.get(muscle);
    if (!level) return {};
    const now = Math.floor(level.value);
    const was = before.get(muscle);
    const seenLevel = seen[muscle];
    return {
      value: level.value,
      gain: was ? now - Math.floor(was.value) : undefined,
      fresh:
        hasSeen && (seenLevel === undefined || now > seenLevel)
          ? now - (seenLevel ?? now)
          : undefined,
      pauseWeeks:
        level.lastAt < pauseSince
          ? Math.floor((end - Date.parse(level.lastAt)) / WEEK_MS)
          : undefined,
    };
  };

  return (
    <TabScreen>
      <BodyMaps selected={trained} />
      {isLoading ? null : (
        <>
          {/* The card and its button open the ranks: what each takes and the muscles in it. */}
          <RankCard
            level={Math.floor(overallLevel(levels))}
            accessibilityLabel={t('ranks.open')}
            onPress={openRanks}
            className="mx-4 mt-1"
          >
            <Button
              label={t('level.overview')}
              variant="secondary"
              size="md"
              accessibilityLabel={t('ranks.open')}
              className="mt-1.5"
              onPress={openRanks}
            />
          </RankCard>
          <View className="gap-2 px-4 pt-7">
            {rows.map((row) => (
              <View key={row[0]} className="flex-row gap-2">
                {row.map((muscle) => (
                  <LevelCard key={muscle} muscle={muscle} {...cardProps(muscle)} />
                ))}
                {row.length === 1 ? <View className="flex-1" /> : null}
              </View>
            ))}
          </View>
        </>
      )}
      {/* The list ends 40pt above the tab bar inset; TabScreen adds 24. */}
      <View className="h-4" />
    </TabScreen>
  );
}
