import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useExerciseName } from '@/shared/data/exercises';
import { cn } from '@/shared/lib/cn';
import { addDays } from '@/shared/lib/date';
import { formatDate, formatNumber } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import type { DistributionChart as DistributionChartData } from '../../lib/charts';
import { DashedLine, useWidth } from './chart-parts';

/** Label column, value column and the 10pt gaps between them and the bar. */
const LABEL = 104;
const VALUE = 24;
const GAPS = 20;
const ROW = 24;
const ROW_GAP = 6;
/** Rows below this share of the guideline stand out. */
const LOW = 0.6;

/** A Monday in 2024, for weekday names. */
const MONDAY = new Date(2024, 0, 1);
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function RowLabel({ by, id, low }: { by: DistributionChartData['by']; id: string; low: boolean }) {
  const { t, i18n } = useTranslation('muscles');
  const exercise = useExerciseName(by === 'exercise' ? id : '', i18n.language);
  const label =
    by === 'muscle'
      ? t(`names.${id}` as 'names.chest')
      : by === 'exercise'
        ? exercise
        : formatDate(addDays(MONDAY, WEEKDAYS.indexOf(id)), { weekday: 'long' });
  return (
    <Text
      numberOfLines={1}
      className={cn(
        'text-caption leading-4',
        low ? 'font-inter-semibold text-fg' : 'font-inter text-fg-2',
      )}
      style={{ width: LABEL }}
    >
      {label}
    </Text>
  );
}

/**
 * How the training is spread (design CO3·6 "Verteilung"): a bar per muscle, exercise or weekday;
 * for muscles against the guideline of 10 sets a week, which sits in the middle of the track, and
 * the muscles well below it in neon.
 */
export function DistributionChart({ chart }: { chart: DistributionChartData }) {
  const { t } = useTranslation('coach');
  const [width, onLayout] = useWidth();
  const reference = chart.reference;
  const top = Math.max(1, reference ? 2 * reference : 0, ...chart.rows.map((r) => r.value));
  const track = Math.max(0, width - LABEL - VALUE - GAPS);
  const referenceX = reference ? LABEL + 10 + (reference / top) * track : null;
  const height = chart.rows.length * (ROW + ROW_GAP) - ROW_GAP;

  return (
    <View className={cn(reference && 'mt-[30px]')} style={{ height }} onLayout={onLayout}>
      {chart.rows.map((row, i) => {
        const low = reference != null && row.value < LOW * reference;
        return (
          <View
            key={row.key}
            className="absolute right-0 left-0 flex-row items-center gap-2.5"
            style={{ top: i * (ROW + ROW_GAP), height: ROW }}
          >
            <RowLabel by={chart.by} id={row.key} low={low} />
            <View className="flex-1">
              <View
                className={cn('h-[18px] rounded-md', low ? 'bg-accent' : 'bg-track')}
                style={{ width: (row.value / top) * track }}
              />
            </View>
            <Text
              className={cn(
                'text-right font-inter-semibold text-caption leading-4',
                low ? 'text-fg' : 'text-subtle',
              )}
              style={{ width: VALUE }}
            >
              {formatNumber(row.value, 0)}
            </Text>
          </View>
        );
      })}
      {width > 0 && referenceX != null ? (
        <>
          <DashedLine vertical length={height + 12} style={{ left: referenceX - 1, top: -6 }} />
          <View
            className="absolute items-center"
            style={{ left: referenceX - 60, width: 120, top: -26 }}
          >
            <Text className="bg-bg px-1 font-inter-semibold text-[11px] leading-[14px] text-fg-2">
              {t('distribution.reference', { count: reference! })}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
