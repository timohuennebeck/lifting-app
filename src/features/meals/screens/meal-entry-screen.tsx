import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { attempt } from '@/shared/lib/async';
import { cn } from '@/shared/lib/cn';
import { toIsoDate } from '@/shared/lib/date';
import {
  appendKey,
  backspace,
  decimalSeparator,
  displayInput,
  type KeypadDigits,
  type KeypadKey,
  parseInput,
  toInput,
} from '@/shared/lib/keypad';
import { MEAL_NAME_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { CharCount } from '@/shared/ui/char-count';
import { Chip } from '@/shared/ui/chip';
import { InputCell } from '@/shared/ui/input-cell';
import { NumberKeypad } from '@/shared/ui/number-keypad';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { Overline } from '../components/overline';
import {
  addMealEntry,
  deleteMealEntry,
  isMeal,
  type Meal,
  type MealDraft,
  type MealEntry,
  MEALS,
  updateMealEntry,
  useMealEntry,
} from '../data/meal-entries';
import { useRelativeDayLabel } from '../hooks/use-relative-day-label';
import { GRAMS, KCAL } from '../lib/format';
import { type Macro, mealAt } from '../lib/intake';

type Field = 'kcal' | Macro;

/** The boxes in order: the keypad's check moves from one to the next. */
const FIELDS: Field[] = ['kcal', 'protein', 'carbs', 'fat'];

/** What the boxes take, as the database does: up to 9999 kcal, grams up to 999.9. */
const KCAL_DIGITS: KeypadDigits = { int: 4 };
const GRAM_DIGITS: KeypadDigits = { int: 3, fraction: 1 };

type Values = Record<Field, number | null>;

/**
 * Logs a new meal (/meals/new, on `date`, for `meal` or the one it's time for) or edits one
 * (/meals/[id]).
 */
export function MealEntryScreen() {
  const { id, date, meal } = useLocalSearchParams<{ id?: string; date?: string; meal?: string }>();
  const { entry } = useMealEntry(id);
  // The entry as it was opened: deleting it from here mustn't empty the form while it closes.
  const [opened, setOpened] = useState<MealEntry | null>(null);
  if (entry && !opened) setOpened(entry);

  if (id) {
    // Blank until it's read, or for good when it was deleted elsewhere: only back leads on.
    return opened ? (
      <MealForm entry={opened} date={opened.date} initialMeal={opened.meal} />
    ) : (
      <Screen header={<ScreenHeader />}>
        <View />
      </Screen>
    );
  }
  return (
    <MealForm
      entry={null}
      date={date ?? toIsoDate(new Date())}
      initialMeal={isMeal(meal) ? meal : mealAt(new Date())}
    />
  );
}

interface MealFormProps {
  /** The meal edited; null for a new one. */
  entry: MealEntry | null;
  date: string;
  initialMeal: Meal;
}

/**
 * What was eaten, at which meal, and its calories and optional protein, carbs and fat, typed
 * with the app's number pad like a set.
 */
function MealForm({ entry, date, initialMeal }: MealFormProps) {
  const { t } = useTranslation(['meals', 'common']);
  const insets = useSafeAreaInsets();
  const userId = useUserId();
  const relativeDay = useRelativeDayLabel();
  const [name, setName] = useState(entry?.name ?? '');
  const [meal, setMeal] = useState(initialMeal);
  const [values, setValues] = useState<Values>({
    kcal: entry?.kcal ?? null,
    protein: entry?.proteinG ?? null,
    carbs: entry?.carbsG ?? null,
    fat: entry?.fatG ?? null,
  });
  const [focus, setFocus] = useState<Field | null>(null);
  const [buffer, setBuffer] = useState('');
  const [pristine, setPristine] = useState(true);
  const [keypadHeight, setKeypadHeight] = useState(320);
  const [saving, setSaving] = useState(false);
  const separator = decimalSeparator();

  /** The values with what is typed written into its box; an emptied box clears it. */
  function withBuffer(): Values {
    if (!focus || pristine) return values;
    return { ...values, [focus]: parseInput(buffer) };
  }

  function focusField(next: Field | null) {
    const current = withBuffer();
    setValues(current);
    setFocus(next);
    setPristine(true);
    setBuffer(next ? toInput(current[next]) : '');
    // The number pad takes over from the keyboard.
    if (next) Keyboard.dismiss();
  }

  // The check moves on through the boxes; after the last one the pad closes.
  const confirm = () => {
    if (!focus) return;
    focusField(FIELDS[FIELDS.indexOf(focus) + 1] ?? null);
  };
  useHardwareBack(() => focusField(null), !!focus);

  const press = (key: KeypadKey) => {
    const kcal = focus === 'kcal';
    setBuffer((b) => appendKey(b, key, !kcal, pristine, kcal ? KCAL_DIGITS : GRAM_DIGITS));
    setPristine(false);
  };
  const erase = () => {
    setBuffer((b) => (pristine ? '' : backspace(b)));
    setPristine(false);
  };
  // A tap anywhere else on the page closes the number pad (what was typed is kept).
  const dismiss = () => {
    if (focus) focusField(null);
  };

  const shown = withBuffer();
  const trimmed = name.trim();
  const valid = !!trimmed && shown.kcal !== null;

  const save = async () => {
    const final = withBuffer();
    setValues(final);
    setFocus(null);
    if (!userId || saving || !trimmed || final.kcal === null) return;
    const draft: MealDraft = {
      date,
      meal,
      name: trimmed,
      kcal: final.kcal,
      proteinG: final.protein,
      carbsG: final.carbs,
      fatG: final.fat,
    };
    const write = entry
      ? () => updateMealEntry(entry.id, draft)
      : () => addMealEntry(userId, draft);
    setSaving(true);
    // The button's own tap is the only haptic, as on the weight entry.
    if (await attempt('Saving the meal failed', write)) router.back();
    else setSaving(false);
  };

  const remove = async () => {
    if (!entry) return;
    await deleteMealEntry(entry.id);
    router.back();
  };

  const label = (field: Field) => t(field === 'kcal' ? 'entry.calories' : `macros.${field}`);

  return (
    <Screen
      header={
        <ScreenHeader
          title={t(entry ? 'entry.editTitle' : 'entry.title')}
          action={
            <Button
              label={t('common:actions.save')}
              size="sm"
              disabled={!valid}
              loading={saving}
              onPress={save}
            />
          }
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Grows to the page, so a tap below the boxes also reaches the closing area.
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: focus ? keypadHeight + 24 : insets.bottom + 24,
        }}
      >
        <Pressable accessible={false} onPress={dismiss} className="flex-1">
          <Text variant="caption" tone="subtle" className="px-5 pt-3">
            {relativeDay(date)}
          </Text>
          <View className="px-5 pt-1">
            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => focusField(null)}
              placeholder={t('entry.name')}
              placeholderTextColor={colors.dim}
              selectionColor={colors.fg}
              maxLength={MEAL_NAME_MAX}
              autoFocus={!entry}
              returnKeyType="next"
              onSubmitEditing={() => focusField('kcal')}
              // Font size only: a line height on a single-line input cuts the placeholder on iOS.
              className="py-0 font-inter-semibold text-[30px] text-fg"
            />
            <CharCount length={name.length} max={MEAL_NAME_MAX} />
          </View>

          <View className="flex-row flex-wrap gap-2 px-4 pt-4">
            {MEALS.map((m) => (
              <Chip
                key={m}
                label={t(`meal.${m}`)}
                selected={meal === m}
                onPress={() => setMeal(m)}
              />
            ))}
          </View>

          <Overline className="px-5 pt-7 pb-2.5">{t('entry.nutrition')}</Overline>
          <View className="mx-4 rounded-[22px] bg-surface px-4">
            {FIELDS.map((field, i) => {
              const active = focus === field;
              return (
                <View
                  key={field}
                  className={cn(
                    'h-16 flex-row items-center gap-3',
                    i > 0 && 'border-t border-line',
                  )}
                >
                  <Text variant="label" numberOfLines={1} className="min-w-0 flex-1 text-base">
                    {label(field)}
                  </Text>
                  <InputCell
                    value={displayInput(active ? buffer : toInput(values[field]), separator)}
                    active={active}
                    pristine={pristine}
                    label={label(field)}
                    placeholder={field === 'kcal' ? undefined : t('entry.optional')}
                    onPress={() => focusField(field)}
                    className="w-28"
                  />
                  <Text tone="subtle" className="w-8 font-inter-medium text-sm">
                    {field === 'kcal' ? KCAL : GRAMS}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text variant="caption" tone="subtle" className="px-5 pt-2.5 font-inter">
            {t('entry.macrosHint')}
          </Text>

          {entry ? (
            <TextButton label={t('entry.delete')} tone="danger" className="mt-6" onPress={remove} />
          ) : null}
        </Pressable>
      </ScrollView>

      {focus ? (
        <NumberKeypad
          decimal={focus !== 'kcal'}
          onKey={press}
          onBackspace={erase}
          onConfirm={confirm}
          onDismiss={() => focusField(null)}
          onLayout={(e) => setKeypadHeight(e.nativeEvent.layout.height)}
        />
      ) : null}
    </Screen>
  );
}
