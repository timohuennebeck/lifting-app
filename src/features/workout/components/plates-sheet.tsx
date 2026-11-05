import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';

import { saveExerciseSetting } from '@/shared/data/exercise-settings';
import { useUnits } from '@/shared/data/profile';
import { cn } from '@/shared/lib/cn';
import { formatNumber, fromDisplayWeight } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { ToggleSwitch } from '@/shared/ui/toggle-switch';

import { type PlateBar, usePlateBar } from '../hooks/use-plate-bar';
import { BAR_STEP, loadBar, type PlateSetup, plateUnit } from '../lib/plates';
import { weightStep } from '../lib/weight-step';
import { PlateDrawing } from './plate-drawing';
import { plateCaption, PlateList, plateNote } from './plate-list';

const CAPTION = 'font-inter-semibold text-[11px] leading-3.5 tracking-[0.9px] text-dim uppercase';

/** The heaviest bar the stepper goes to, per unit. */
const BAR_MAX = { kg: 100, lb: 220 } as const;

/** The bar as changed in the sheet; saved when it closes. */
type BarDraft = Pick<PlateBar, 'weight' | 'noBar'>;

interface StepButtonProps {
  icon: 'minus' | 'plus';
  label: string;
  onPress: () => void;
}

function StepButton({ icon, label, onPress }: StepButtonProps) {
  return (
    <PressableScale
      haptic="select"
      activeScale={0.94}
      accessibilityLabel={label}
      onPress={onPress}
      className="size-16 items-center justify-center rounded-full bg-raised"
    >
      <Icon name={icon} size={18} color={colors.fg} />
    </PressableScale>
  );
}

interface PlatesSheetBodyProps {
  initialWeight: number;
  initialBar: BarDraft;
  setup: PlateSetup;
  /** Every change of the bar, for the sheet to save when it closes. */
  onBarChange: (bar: BarDraft) => void;
  onDone: (weight: number) => void;
}

/** The sheet's content: mounted while it shows, so it starts from the weight typed each time. */
function PlatesSheetBody({
  initialWeight,
  initialBar,
  setup,
  onBarChange,
  onDone,
}: PlatesSheetBodyProps) {
  const { t } = useTranslation(['workout', 'common']);
  const units = useUnits();
  const unit = plateUnit(units);
  const { width } = useWindowDimensions();
  const [weight, setWeight] = useState(initialWeight);
  const [draft, setDraft] = useState(initialBar);
  const sled = setup.carrier === 'sled';

  const changeBar = (next: BarDraft) => {
    setDraft(next);
    onBarChange(next);
  };
  const stepBar = (by: number) =>
    changeBar({ ...draft, weight: clamp(draft.weight + by, BAR_STEP[unit], BAR_MAX[unit]) });

  const bar = draft.noBar ? 0 : draft.weight;
  const step = weightStep('barbell', [], weight, units);
  const change = (by: number) => setWeight((w) => Math.max(0, Math.round((w + by) / step) * step));
  const load = loadBar(weight, bar, unit, setup.sides);
  const plates = load.kind === 'loaded' ? load.plates : [];
  const note = plateNote(load, bar, setup.carrier);
  const shortOf = load.kind === 'loaded' && !load.exact ? load.loaded : null;

  return (
    <View className="pb-2.5">
      <View className="flex-row items-center justify-between">
        <StepButton icon="minus" label={t('plates.lighter')} onPress={() => change(-step)} />
        <View className="flex-row items-baseline gap-1.5">
          <Text className="font-inter-semibold text-[64px] leading-16 tracking-[-1.5px] text-fg tabular-nums">
            {formatNumber(weight, 2)}
          </Text>
          <Text className="font-inter-medium text-xl leading-6 text-subtle">{unit}</Text>
        </View>
        <StepButton icon="plus" label={t('plates.heavier')} onPress={() => change(step)} />
      </View>
      <View className="items-center pt-6.5 pb-7.5">
        <PlateDrawing
          plates={plates}
          unit={unit}
          withBar={bar > 0}
          width={Math.min(330, width - 48)}
          scale={3}
          faded={!plates.length}
        />
      </View>
      <Text className={cn(CAPTION, 'px-1')}>
        {t(`plates.${plateCaption(setup)}`)}
        {shortOf != null ? (
          <Text className="text-amber">
            {` · ${t('plates.loaded', { weight: `${formatNumber(shortOf, 2)} ${unit}` })}`}
          </Text>
        ) : null}
      </Text>
      <View className="min-h-16.5 px-1 pt-2.5 pb-6.5">
        {note ? (
          <Text variant="body" tone="subtle" className="font-inter-medium">
            {t(`plates.${note}`)}
          </Text>
        ) : (
          <PlateList plates={plates} unit={unit} size="sheet" />
        )}
      </View>
      {draft.noBar ? null : (
        <View className="flex-row items-center justify-between pb-3.5">
          <Text className={cn(CAPTION, 'px-1')}>
            {t(sled ? 'plates.sledWeight' : 'plates.barWeight')}
          </Text>
          <View className="flex-row items-center gap-1">
            <IconButton
              icon="minus"
              size={40}
              haptic="select"
              className="bg-raised"
              accessibilityLabel={t('plates.lighter')}
              disabled={draft.weight <= BAR_STEP[unit]}
              onPress={() => stepBar(-BAR_STEP[unit])}
            />
            <Text variant="label" className="min-w-19 text-center tabular-nums">
              {`${formatNumber(draft.weight, 2)} ${unit}`}
            </Text>
            <IconButton
              icon="plus"
              size={40}
              haptic="select"
              className="bg-raised"
              accessibilityLabel={t('plates.heavier')}
              disabled={draft.weight >= BAR_MAX[unit]}
              onPress={() => stepBar(BAR_STEP[unit])}
            />
          </View>
        </View>
      )}
      <View className="flex-row items-center justify-between pb-5.5 pl-1">
        <Text variant="body" tone="secondary" className="font-inter-medium">
          {t(sled ? 'plates.withoutSled' : 'plates.withoutBar')}
        </Text>
        <ToggleSwitch
          value={draft.noBar}
          accessibilityLabel={t(sled ? 'plates.withoutSled' : 'plates.withoutBar')}
          onChange={(noBar) => changeBar({ ...draft, noBar })}
        />
      </View>
      <Button label={t('common:actions.done')} onPress={() => onDone(weight)} />
    </View>
  );
}

export interface PlatesSheetProps {
  visible: boolean;
  /** The weight in the box, in the user's unit; the bar's when it is empty. */
  weight: number | null;
  exerciseId: string;
  setup: PlateSetup;
  onClose: () => void;
  /** "Done": the weight set with the stepper goes into the box. */
  onDone: (weight: number) => void;
}

/**
 * The plates for a weight, bigger: a stepper for the weight, one end of the bar drawn, the
 * plates and the bar they go on. Opened from the ⓘ beside the number pad's plates. A changed bar
 * is saved for the exercise when the sheet closes, with "Done" or without.
 */
export function PlatesSheet({
  visible,
  weight,
  exerciseId,
  setup,
  onClose,
  onDone,
}: PlatesSheetProps) {
  const { t } = useTranslation('workout');
  const units = useUnits();
  const userId = useUserId();
  const current = usePlateBar(exerciseId, setup);
  const changed = useRef<BarDraft | null>(null);

  const saveBar = () => {
    const bar = changed.current;
    changed.current = null;
    if (!bar || !userId) return;
    if (bar.weight === current.weight && bar.noBar === current.noBar) return;
    void saveExerciseSetting(userId, exerciseId, {
      barKg: fromDisplayWeight(bar.weight, units),
      noBar: bar.noBar,
    });
  };

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        saveBar();
        onClose();
      }}
      title={t('plates.title')}
    >
      <PlatesSheetBody
        initialWeight={weight ?? current.bar}
        initialBar={{ weight: current.weight, noBar: current.noBar }}
        setup={setup}
        onBarChange={(bar) => {
          changed.current = bar;
        }}
        onDone={(w) => {
          saveBar();
          onDone(w);
        }}
      />
    </Sheet>
  );
}
