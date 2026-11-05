import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUnits } from '@/shared/data/profile';
import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/format';
import { parseInput } from '@/shared/lib/keypad';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { usePlateBar } from '../hooks/use-plate-bar';
import { loadBar, type PlateSetup, plateUnit } from '../lib/plates';
import { usePlatesStore } from '../stores/plates-store';
import { useWorkoutSessionStore } from '../stores/workout-session-store';
import { PlateDrawing } from './plate-drawing';
import { plateCaption, PlateList, plateNote } from './plate-list';

const CAPTION = 'font-inter-semibold text-[11px] leading-3.5 tracking-[0.9px] text-dim uppercase';

export interface KeypadPlatesProps {
  exerciseId: string;
  setup: PlateSetup;
  /** The ⓘ: the plates sheet with the bar and a stepper. */
  onOpenSheet: () => void;
}

/**
 * The plates for the weight being typed, above the number pad's keys (exercises loaded with
 * plates). Open: one end of the bar drawn beside the plates in columns; folded: one line.
 */
export function KeypadPlates({ exerciseId, setup, onOpenSheet }: KeypadPlatesProps) {
  const { t } = useTranslation('workout');
  const unit = plateUnit(useUnits());
  const weight = useWorkoutSessionStore((s) => s.input.weight);
  const { bar } = usePlateBar(exerciseId, setup);
  const open = usePlatesStore((s) => s.open);
  const toggleOpen = usePlatesStore((s) => s.toggleOpen);

  const load = loadBar(parseInput(weight), bar, unit, setup.sides);
  const plates = load.kind === 'loaded' ? load.plates : [];
  const note = plateNote(load, bar, setup.carrier);
  const caption = t(`plates.${plateCaption(setup)}`);
  // The plates fall short of the weight typed: the weight they make, in amber.
  const shortOf = load.kind === 'loaded' && !load.exact ? load.loaded : null;
  const short = shortOf != null;

  const info = (
    <PressableScale
      hitSlop={12}
      accessibilityLabel={t('plates.open')}
      onPress={onOpenSheet}
      className="-my-0.75 size-5 items-center justify-center rounded-full bg-white/8"
    >
      <Icon name="info-glyph" size={8} color={colors.fg} />
    </PressableScale>
  );
  const fold = (
    <PressableScale
      haptic="select"
      hitSlop={8}
      accessibilityLabel={t(open ? 'plates.fold' : 'plates.unfold')}
      onPress={toggleOpen}
      className="-my-1.75 size-7 items-center justify-center rounded-full bg-white/8"
    >
      <View style={open ? { transform: [{ rotate: '180deg' }] } : undefined}>
        <Icon name="chevron-down" size={11} color={colors.fg2} />
      </View>
    </PressableScale>
  );

  if (!open) {
    return (
      <View className="flex-row items-center gap-3 px-0.5 pb-1">
        <View className="flex-row items-center gap-1.5">
          <Text className={cn(CAPTION, short && 'text-amber')}>{caption}</Text>
          {info}
        </View>
        {note ? (
          <Text variant="caption" tone="subtle" className="flex-1 font-inter-medium">
            {t(`plates.${note}`)}
          </Text>
        ) : (
          <PlateList plates={plates} unit={unit} size="pad" line />
        )}
        {fold}
      </View>
    );
  }

  return (
    <View className="gap-2 px-0.5 pb-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Text className={CAPTION}>
            {caption}
            {shortOf != null ? (
              <Text className="text-amber">
                {` · ${t('plates.loaded', { weight: `${formatNumber(shortOf, 2)} ${unit}` })}`}
              </Text>
            ) : null}
          </Text>
          {info}
        </View>
        {fold}
      </View>
      <View className="h-11 flex-row items-center gap-2.5">
        <PlateDrawing
          plates={plates}
          unit={unit}
          withBar={bar > 0}
          width={104}
          faded={!plates.length}
        />
        {note ? (
          <Text variant="label" tone="subtle" className="flex-1 font-inter-medium">
            {t(`plates.${note}`)}
          </Text>
        ) : (
          <PlateList plates={plates} unit={unit} size="pad" />
        )}
      </View>
    </View>
  );
}
