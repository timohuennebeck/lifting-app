import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnits } from '@/shared/data/profile';
import {
  deleteWeightEntry,
  saveWeightEntryMoved,
  useWeightEntries,
  type WeightEntry,
} from '@/shared/data/weight-entries';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { addDays, fromIsoDate, toIsoDate } from '@/shared/lib/date';
import { formatNumber, formatShortDate, type UnitSystem } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';
import {
  BODY_WEIGHT_LIMITS_KG,
  DEFAULT_BODY_WEIGHT_KG,
  snapTo,
  toStoredKg,
  toUnits,
} from '@/shared/lib/body-weight';

import { useDayLabel } from '../components/entry-row';
import { formatChange } from '../lib/format';
import { pickDate } from '../lib/pick-date';

/** Ruler steps: 0.1 kg or 0.2 lb, a long tick at every whole kg or lb. */
const SCALES = {
  metric: { step: 0.1, majorEvery: 10, midEvery: 5, span: 30 },
  imperial: { step: 0.2, majorEvery: 5, midEvery: 5, span: 60 },
} as const;

/** The weight the ruler starts at: the day's own entry, else the last one before it. */
function startingKg(entries: WeightEntry[], date: string) {
  const own = entries.find((e) => e.date === date);
  const before = entries.filter((e) => e.date < date).at(-1);
  return (own ?? before ?? entries.at(-1))?.weightKg ?? DEFAULT_BODY_WEIGHT_KG;
}

/** Log or edit the weight of a day (GW·1): ruler, −/+ and the change since the last entry. */
export function WeightEntryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { entries, isLoading } = useWeightEntries();
  const units = useUnits();
  if (isLoading) return <View className="flex-1 bg-bg" />;
  return (
    <EntryForm
      initialDate={date}
      entries={entries}
      units={units}
      initialKg={startingKg(entries, date)}
    />
  );
}

interface EntryFormProps {
  initialDate: string;
  entries: WeightEntry[];
  units: UnitSystem;
  initialKg: number;
}

function EntryForm({ initialDate, entries, units, initialKg }: EntryFormProps) {
  const { t } = useTranslation(['weight', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const userId = useUserId();
  const dayLabel = useDayLabel();
  const scale = SCALES[units];
  const [date, setDate] = useState(initialDate);
  const [saving, setSaving] = useState(false);

  // The ruler works in the display unit, on its steps, around a weight: where it started, or the
  // entry of a day picked in the calendar.
  const rangeAround = (weightKg: number) => {
    const start = Math.round(toUnits(weightKg, units));
    const { min, max } = BODY_WEIGHT_LIMITS_KG;
    return {
      min: Math.max(Math.ceil(toUnits(min, units)), start - scale.span),
      max: Math.min(Math.floor(toUnits(max, units)), start + scale.span),
    };
  };
  const [range, setRange] = useState(() => rangeAround(initialKg));
  const [value, setValue] = useState(() =>
    clamp(snapTo(toUnits(initialKg, units), scale.step), range.min, range.max),
  );
  const set = (next: number) => setValue(clamp(snapTo(next, scale.step), range.min, range.max));
  const kg = toStoredKg(value, units);

  const original = entries.find((e) => e.date === initialDate) ?? null;
  // The shown day's own entry: picking a day that has one edits it.
  const own = entries.find((e) => e.date === date) ?? null;
  const previous = entries.filter((e) => e.date < date).at(-1);

  // A day picked in the calendar keeps the weight set here, unless it has an entry of its own.
  const choose = (next: string) => {
    const picked = entries.find((e) => e.date === next);
    setDate(next);
    if (!picked) return;
    const around = rangeAround(picked.weightKg);
    setRange(around);
    setValue(clamp(snapTo(toUnits(picked.weightKg, units), scale.step), around.min, around.max));
  };
  const unit = t(`common:units.${units === 'imperial' ? 'lb' : 'kg'}`);
  const today = toIsoDate(new Date());
  // With the year when it isn't this one, as in "seit 28. Dez. 2025".
  const shortDate = (iso: string) => formatShortDate(fromIsoDate(iso));
  const dateLabel =
    date === today
      ? t('entry.today', { date: shortDate(date) })
      : date === toIsoDate(addDays(new Date(), -1))
        ? t('entry.yesterday', { date: shortDate(date) })
        : dayLabel(date);

  const save = async () => {
    if (!userId || saving) return;
    setSaving(true);
    // Moving the entry this screen opened on to an empty day; a day with its own is edited.
    const moved = own ? null : original;
    // No `finally`, and nothing conditional inside the try: the React Compiler can't compile a
    // component with either.
    try {
      await saveWeightEntryMoved(userId, date, kg, moved);
      // The button's own tap is the only haptic: the save is instant, and a success pattern
      // right after it merged into one long buzz.
      router.back();
    } catch (error) {
      setSaving(false);
      throw error;
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!own) return;
    await deleteWeightEntry(own.id);
    router.back();
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        title={t('entry.title')}
        // As wide as "Historie" on the right, so the title stays centred.
        leading={
          <View className="w-19">
            <IconButton
              icon="chevron-left"
              accessibilityLabel={t('common:actions.back')}
              onPress={() => router.back()}
            />
          </View>
        }
        action={
          <PressableScale
            haptic="tap"
            onPress={() => router.dismissTo('/body-weight')}
            className="h-10.5 w-19 items-center justify-center rounded-full bg-elevated"
          >
            <Text className="relative top-px font-inter-semibold text-sm">
              {t('entry.history')}
            </Text>
          </PressableScale>
        }
      />
      <View className="flex-1 items-center">
        <PressableScale
          haptic="tap"
          accessibilityLabel={t('entry.date')}
          onPress={() => pickDate(choose)}
          className="mt-5.5 h-9 justify-center rounded-full border border-[#333333] px-3"
        >
          <Text className="relative top-px font-inter-semibold text-sm">{dateLabel}</Text>
        </PressableScale>

        <View className="mt-12.5 flex-row items-baseline gap-1.5">
          <Text
            className="font-inter-semibold text-[96px] leading-[98px] tracking-[-3px] tabular-nums"
            accessibilityLiveRegion="polite"
          >
            {formatNumber(value, 1, 1)}
          </Text>
          <Text tone="muted" className="font-inter-semibold text-[25px]">
            {unit}
          </Text>
        </View>
        <Text tone="muted" className="mt-0.75 font-inter-medium text-sm leading-5 tabular-nums">
          {previous
            ? t('entry.since', {
                value: `${formatChange(kg - previous.weightKg, units)} ${unit}`,
                date: shortDate(previous.date),
              })
            : t('entry.none')}
        </Text>

        <RulerPicker
          // A new range starts the scale over at its value.
          key={`${range.min}:${range.max}`}
          value={value}
          onChange={set}
          min={range.min}
          max={range.max}
          step={scale.step}
          majorEvery={scale.majorEvery}
          midEvery={scale.midEvery}
          className="mt-8"
        />
        <View className="mt-5 flex-row gap-4">
          <IconButton
            icon="minus"
            size={56}
            iconSize={14}
            haptic="select"
            accessibilityLabel={t('common:actions.decrease')}
            onPress={() => set(value - scale.step)}
          />
          <IconButton
            icon="plus"
            size={56}
            iconSize={12}
            haptic="select"
            accessibilityLabel={t('common:actions.increase')}
            onPress={() => set(value + scale.step)}
          />
        </View>
        {own ? (
          <TextButton label={t('entry.delete')} tone="danger" className="mt-4" onPress={remove} />
        ) : null}
      </View>
      <View className="px-4" style={{ paddingBottom: footerInset }}>
        <Button label={t('common:actions.save')} loading={saving} onPress={save} />
      </View>
    </View>
  );
}
