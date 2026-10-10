import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { defaultSetDrafts, isTimed } from '@/shared/data/exercises';
import { newId } from '@/shared/data/json';
import { restSecondsFor } from '@/shared/data/templates';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { appendKey, backspace, type KeypadKey } from '@/shared/lib/keypad';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { NumberKeypad } from '@/shared/ui/number-keypad';
import { Text } from '@/shared/ui/text';
import { ToggleSwitch } from '@/shared/ui/toggle-switch';

import { RirPickerSheet } from './rir-picker-sheet';
import { type SetDraft, SetEditorRow, type TargetField } from './set-editor-row';

const REST_STEP = 15;
const REST_MIN = 15;
const REST_MAX = 600;
const MAX_SETS = 10;
/** Row height plus gap, for scrolling the edited row above the number pad. */
const ROW = 66;

interface Focus {
  index: number;
  field: TargetField;
}

/** A row with one target box set (null clears it); the other box is never changed. */
const withTarget = (set: SetDraft, field: TargetField, value: number | null): SetDraft =>
  field === 'min' ? { ...set, targetMin: value } : { ...set, targetMax: value };

/** A minimum above the maximum: shown as an error rather than corrected behind the user's back. */
const outOfOrder = (set: SetDraft) =>
  set.targetMin != null && set.targetMax != null && set.targetMin > set.targetMax;

const boxValue = (set: SetDraft, field: TargetField) =>
  field === 'min' ? set.targetMin : set.targetMax;

export interface SetTargetsFormProps {
  exerciseId: string;
  initialSets: SetDraft[];
  /** Rest override in seconds; null uses the exercise's default. */
  initialRest: number | null;
  onSave: (sets: SetDraft[], rest: number | null) => Promise<void>;
}

/**
 * Edit target sets: min/max reps (or seconds) typed with the app's number pad, RIR and a rest
 * override (00·P2 C·S). Shared by plan templates, the workout builder and the running workout.
 */
export function SetTargetsForm({
  exerciseId,
  initialSets,
  initialRest,
  onSave,
}: SetTargetsFormProps) {
  const { t } = useTranslation(['training', 'common']);
  const footerInset = useFooterInset();
  const timed = isTimed(exerciseId);
  const limit = timed ? 600 : 60;
  const [sets, setSets] = useState(initialSets);
  const [rest, setRest] = useState(initialRest);
  const [rirIndex, setRirIndex] = useState<number | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [buffer, setBuffer] = useState('');
  const [pristine, setPristine] = useState(true);
  const [keypadHeight, setKeypadHeight] = useState(320);
  const [saving, setSaving] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const listTop = useRef(0);
  const defaultRest = restSecondsFor(exerciseId, null);
  const shownRest = rest ?? defaultRest;

  // Keep the edited row above the number pad.
  useEffect(() => {
    if (!focus) return;
    const y = Math.max(0, listTop.current + focus.index * ROW - 120);
    scroll.current?.scrollTo({ y, animated: true });
  }, [focus]);

  /**
   * The sets with what is typed written into its box and the same box of every row below, so
   * they follow as it is typed. An emptied box clears the target (min and max are optional).
   */
  function withBuffer(): SetDraft[] {
    if (!focus || pristine) return sets;
    const value = buffer ? clamp(Number(buffer), 1, limit) : null;
    return sets.map((s, i) => (i < focus.index ? s : withTarget(s, focus.field, value)));
  }

  function focusBox(next: Focus | null) {
    const current = withBuffer();
    setSets(current);
    setFocus(next);
    setPristine(true);
    const value = next ? boxValue(current[next.index], next.field) : null;
    setBuffer(value == null ? '' : String(value));
  }

  // The check moves on: min → max → the next row; after the last box the pad closes.
  function confirm() {
    if (!focus) return;
    if (focus.field === 'min') focusBox({ index: focus.index, field: 'max' });
    else if (focus.index + 1 < sets.length) focusBox({ index: focus.index + 1, field: 'min' });
    else focusBox(null);
  }

  useHardwareBack(() => focusBox(null), !!focus);

  const press = (key: KeypadKey) => {
    setBuffer((b) => appendKey(b, key, false, pristine));
    setPristine(false);
  };
  const erase = () => {
    setBuffer((b) => (pristine ? '' : backspace(b)));
    setPristine(false);
  };

  const addSet = () => {
    focusBox(null);
    setSets((all) => {
      const last = all[all.length - 1] ?? defaultSetDrafts(exerciseId, 1)[0];
      return [...all, { ...last, key: newId() }];
    });
  };
  const removeSet = (index: number) => {
    focusBox(null);
    setSets((all) => all.filter((_, j) => j !== index));
  };
  const stepRest = (delta: number) => {
    focusBox(null);
    setRest((r) => clamp((r ?? defaultRest) + delta, REST_MIN, REST_MAX));
  };
  // A tap anywhere else on the page closes the number pad (what was typed is kept).
  const dismiss = () => {
    if (focus) focusBox(null);
  };

  const save = async () => {
    const final = withBuffer();
    setSets(final);
    setFocus(null);
    if (final.some(outOfOrder)) {
      haptics.error();
      return;
    }
    setSaving(true);
    try {
      await onSave(final, rest);
    } finally {
      setSaving(false);
    }
  };

  const shown = withBuffer();
  // From what is entered, not what is being typed: no error flashes up on the first digit.
  const invalid = sets.some(outOfOrder);

  return (
    <View className="flex-1">
      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Grows to the page, so a tap below the rows also reaches the closing area.
        contentContainerStyle={{ flexGrow: 1, paddingBottom: focus ? keypadHeight + 24 : 24 }}
      >
        <Pressable accessible={false} onPress={dismiss} className="flex-1">
          <View className="flex-row items-center gap-2.5 px-5 pt-6 pb-2">
            {(['set', timed ? 'minSeconds' : 'min', timed ? 'maxSeconds' : 'max'] as const).map(
              (key) => (
                <Text
                  key={key}
                  variant="overline"
                  className={cn(
                    'text-center text-[11px] tracking-[0.9px] text-dim',
                    key === 'set' ? 'w-10' : 'flex-1',
                  )}
                >
                  {t(`sets.${key}`)}
                </Text>
              ),
            )}
            <Text
              variant="overline"
              className="w-7 text-right text-[11px] tracking-[0.9px] text-dim"
            >
              {timed ? '' : t('sets.rir')}
            </Text>
          </View>
          <View
            className="gap-2.5 px-5"
            onLayout={(e) => (listTop.current = e.nativeEvent.layout.y)}
          >
            {shown.map((set, i) => (
              <SetEditorRow
                key={set.key}
                index={i}
                set={set}
                timed={timed}
                activeField={focus?.index === i ? focus.field : null}
                buffer={buffer}
                pristine={pristine}
                onFocus={(field) => focusBox({ index: i, field })}
                onRirPress={() => {
                  focusBox(null);
                  setRirIndex(i);
                }}
                error={outOfOrder(sets[i] ?? set)}
                onRemove={sets.length > 1 ? () => removeSet(i) : undefined}
              />
            ))}
          </View>
          {invalid ? (
            <Text variant="caption" tone="danger" className="px-5 pt-3">
              {t(timed ? 'sets.orderErrorSeconds' : 'sets.orderError')}
            </Text>
          ) : null}
          <View className="flex-row px-5 pt-4">
            <IconButton
              icon="plus"
              size={40}
              iconSize={14}
              haptic="tap"
              className="bg-raised"
              disabled={sets.length >= MAX_SETS}
              accessibilityLabel={t('sets.addSet')}
              onPress={addSet}
            />
          </View>

          <View className="mx-5 mt-5.5 gap-3.5 pt-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text variant="label" className="text-base">
                  {t('sets.customRest')}
                </Text>
                <Text variant="caption" tone="subtle" className="mt-0.75 font-inter">
                  {t('sets.customRestHint')}
                </Text>
              </View>
              <ToggleSwitch
                value={rest !== null}
                accessibilityLabel={t('sets.customRest')}
                onChange={(on) => {
                  focusBox(null);
                  setRest(on ? defaultRest : null);
                }}
              />
            </View>
            <View
              className={cn(
                'h-16 flex-row items-center justify-between',
                rest === null && 'opacity-35',
              )}
              pointerEvents={rest === null ? 'none' : 'auto'}
            >
              <IconButton
                icon="minus"
                size={48}
                haptic="select"
                className="bg-raised"
                accessibilityLabel={t('common:actions.decrease')}
                disabled={shownRest <= REST_MIN}
                onPress={() => stepRest(-REST_STEP)}
              />
              <View className="flex-row items-baseline gap-1.5">
                <Text variant="headline" className="text-[26px] leading-7.5">
                  {formatDuration(shownRest)}
                </Text>
                <Text variant="caption" tone="subtle" className="font-inter text-sm">
                  {t('sets.minutes')}
                </Text>
              </View>
              <IconButton
                icon="plus"
                size={48}
                haptic="select"
                className="bg-raised"
                accessibilityLabel={t('common:actions.increase')}
                disabled={shownRest >= REST_MAX}
                onPress={() => stepRest(REST_STEP)}
              />
            </View>
          </View>
        </Pressable>
      </ScrollView>

      <View className="px-4 pt-1.5" style={{ paddingBottom: footerInset }}>
        <Button
          label={t('common:actions.done')}
          disabled={invalid}
          loading={saving}
          onPress={save}
        />
      </View>

      {focus ? (
        <NumberKeypad
          decimal={false}
          onKey={press}
          onBackspace={erase}
          onConfirm={confirm}
          onDismiss={() => focusBox(null)}
          onLayout={(e) => setKeypadHeight(e.nativeEvent.layout.height)}
        />
      ) : null}

      <RirPickerSheet
        visible={rirIndex !== null}
        value={rirIndex !== null ? (sets[rirIndex]?.rir ?? null) : null}
        onClose={() => setRirIndex(null)}
        onSelect={(rir) => {
          // Like the boxes, the rows below take the same RIR.
          if (rirIndex !== null) {
            setSets((all) => all.map((s, i) => (i >= rirIndex ? { ...s, rir } : s)));
          }
          setRirIndex(null);
        }}
      />
    </View>
  );
}
