import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TabScreen } from '@/shared/components/tab-screen';
import { BodyMaps, MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map';
import { RangeTabs } from '@/shared/ui/range-tabs';
import { Text } from '@/shared/ui/text';

import { MuscleSetRow } from '../components/muscle-set-row';
import { useMuscleCounts } from '../hooks/use-muscle-sets';
import { RARE_MUSCLES } from '../lib/muscle-sets';
import { useSetRangeStore } from '../stores/set-range-store';

const openMuscle = (muscle: MuscleId) =>
  router.push({ pathname: '/muscle/[id]', params: { id: muscle } });

/** "Primär" or "Sekundär" with the mark its sets have in the bars. */
function LegendItem({ label, primary }: { label: string; primary: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={primary ? 'h-1.5 w-3 rounded-full bg-accent' : 'h-1.5 w-3 rounded-full bg-fg-2'}
      />
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
    </View>
  );
}

/**
 * Sätze tab: how many sets each muscle got in the last 7 to 90 days, on the body map (primary
 * in neon, only secondary in grey) and as a list, most sets first. A set counts in full for
 * every muscle it works. Untrained muscles follow in grey with 0; neck and shins only once they
 * have sets. A row opens the muscle's page.
 */
export function SetsScreen() {
  const { t } = useTranslation('muscles');
  const range = useSetRangeStore((s) => s.range);
  const choose = useSetRangeStore((s) => s.choose);
  const { counts, isLoading } = useMuscleCounts(range);

  const primary = MUSCLE_IDS.filter((m) => (counts.get(m)?.primary ?? 0) > 0);
  const secondary = MUSCLE_IDS.filter(
    (m) => !counts.get(m)?.primary && (counts.get(m)?.secondary ?? 0) > 0,
  );
  const max = Math.max(1, ...[...counts.values()].map((c) => c.total));
  const trained = MUSCLE_IDS.filter((m) => counts.has(m)).sort((a, b) => {
    const ca = counts.get(a)!;
    const cb = counts.get(b)!;
    return cb.total - ca.total || cb.primary - ca.primary;
  });
  const untrained = MUSCLE_IDS.filter((m) => !counts.has(m) && !RARE_MUSCLES.has(m)).sort((a, b) =>
    t(`names.${a}`).localeCompare(t(`names.${b}`)),
  );

  return (
    <TabScreen>
      <BodyMaps selected={primary} secondary={secondary} />
      <RangeTabs value={range} onChange={choose} className="mx-4 mt-1" />
      {isLoading ? null : (
        <>
          <View className="flex-row gap-5 px-4 pt-6 pb-2">
            <LegendItem label={t('breakdown.primary')} primary />
            <LegendItem label={t('breakdown.secondary')} primary={false} />
          </View>
          {[...trained, ...untrained].map((muscle) => (
            <MuscleSetRow
              key={muscle}
              muscle={muscle}
              count={counts.get(muscle)}
              max={max}
              onPress={openMuscle}
            />
          ))}
        </>
      )}
      <View className="h-4" />
    </TabScreen>
  );
}
