import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import {
  createCustomExercise,
  type CustomExerciseDraft,
  updateCustomExercise,
  useHasLoggedSets,
} from '@/shared/data/custom-exercises';
import {
  activeExerciseIds,
  exerciseName,
  type Measure,
  useCustomExerciseStore,
} from '@/shared/data/exercises';
import { DEFAULT_REST } from '@/shared/data/templates';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import {
  type BodyPartId,
  type BodyView,
  MUSCLE_IDS,
  MuscleChip,
  type MuscleId,
  MuscleMap,
} from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RestStepper } from '@/shared/ui/rest-stepper';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';
import { ToggleSwitch } from '@/shared/ui/toggle-switch';

import { useCreatedExerciseStore } from '../stores/created-exercise-store';

const NAME_MAX = 60;

const isMuscle = (part: BodyPartId) => (MUSCLE_IDS as readonly BodyPartId[]).includes(part);

interface Muscles {
  primary: MuscleId[];
  secondary: MuscleId[];
}

/** A muscle tapped on the map: off again, or on (primary while there is none, else secondary). */
function toggleMuscle({ primary, secondary }: Muscles, muscle: MuscleId): Muscles {
  if (primary.includes(muscle) || secondary.includes(muscle)) {
    return {
      primary: primary.filter((m) => m !== muscle),
      secondary: secondary.filter((m) => m !== muscle),
    };
  }
  return primary.length
    ? { primary, secondary: [...secondary, muscle] }
    : { primary: [muscle], secondary };
}

/** A chip tapped: the muscle moves between primary and secondary. */
function switchRole({ primary, secondary }: Muscles, muscle: MuscleId): Muscles {
  return primary.includes(muscle)
    ? { primary: primary.filter((m) => m !== muscle), secondary: [...secondary, muscle] }
    : { primary: [...primary, muscle], secondary: secondary.filter((m) => m !== muscle) };
}

function SectionLabel({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Text variant="overline" tone={accent ? 'accent' : 'subtle'} className="text-xs">
        {label}
      </Text>
      <View
        className={cn(
          'size-5.5 items-center justify-center rounded-full',
          accent ? 'bg-accent' : 'bg-control',
        )}
      >
        <Text variant="caption" tone={accent ? 'onAccent' : 'default'} className="text-xs">
          {count}
        </Text>
      </View>
    </View>
  );
}

/**
 * New or edited custom exercise (design 4b): name, muscles tapped on the body map and sorted into
 * primary and secondary, what a set logs and the rest between sets. Once a set is logged, what the
 * exercise logs stays as it is. Opened with the plus of the exercise picker (/custom-exercise/new),
 * which then picks it, or from the exercise's own page (/custom-exercise/[id]).
 */
export function CustomExerciseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t, i18n } = useTranslation(['exercises', 'muscles']);
  const userId = useUserId();
  const existing = useCustomExerciseStore((s) => (id ? s.exercises[id] : undefined));
  const { data: logged = false } = useHasLoggedSets(existing?.id);
  const locked = !!existing && logged;

  const [name, setName] = useState(existing?.name ?? '');
  const [muscles, setMuscles] = useState<Muscles>({
    primary: existing?.primary ?? [],
    secondary: existing?.secondary ?? [],
  });
  const [timed, setTimed] = useState(existing?.measures.includes('seconds') ?? false);
  const [weighted, setWeighted] = useState(existing?.measures.includes('weight') ?? true);
  const [rest, setRest] = useState(existing?.restSeconds ?? DEFAULT_REST);
  const [view, setView] = useState<BodyView>('front');
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();
  // Two exercises of one name couldn't be told apart in the picker.
  const taken = useMemo(() => {
    const key = trimmed.toLocaleLowerCase(i18n.language);
    return (
      !!key &&
      activeExerciseIds().some(
        (other) =>
          other !== existing?.id &&
          exerciseName(other, i18n.language).toLocaleLowerCase(i18n.language) === key,
      )
    );
  }, [trimmed, existing?.id, i18n.language]);
  const { primary, secondary } = muscles;
  const valid = !!trimmed && !taken && primary.length > 0;
  const selected = useMemo(() => [...primary, ...secondary], [primary, secondary]);

  async function save() {
    if (!valid || saving || !userId) return;
    setSaving(true);
    const measures: Measure[] = [
      ...(weighted ? ['weight' as const] : []),
      timed ? 'seconds' : 'reps',
    ];
    const draft: CustomExerciseDraft = {
      name: trimmed,
      primary,
      secondary,
      measures,
      restSeconds: rest,
    };
    try {
      if (existing) {
        await updateCustomExercise(existing.id, draft, existing);
      } else {
        useCreatedExerciseStore.setState({ id: await createCustomExercise(userId, draft) });
      }
      haptics.success();
      router.back();
    } catch (error) {
      console.warn('Saving the custom exercise failed', error);
      haptics.error();
      setSaving(false);
    }
  }

  const chip = (muscle: MuscleId, isPrimary: boolean) => (
    <PressableScale
      key={muscle}
      haptic="select"
      accessibilityRole="button"
      onPress={() => setMuscles((m) => switchRole(m, muscle))}
    >
      <MuscleChip
        art={muscle}
        label={t(`muscles:names.${muscle}`)}
        highlight={isPrimary}
        selected={isPrimary}
      />
    </PressableScale>
  );

  return (
    <Screen
      scroll
      header={
        <ScreenHeader
          icon="close"
          title={t(existing ? 'custom.editTitle' : 'custom.title')}
          action={
            <Button
              label={t('custom.save')}
              size="sm"
              disabled={!valid}
              loading={saving}
              onPress={save}
            />
          }
        />
      }
    >
      <View className="px-5 pt-4">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('custom.namePlaceholder')}
          placeholderTextColor={colors.dim}
          selectionColor={colors.fg}
          maxLength={NAME_MAX}
          autoFocus={!existing}
          returnKeyType="done"
          className="font-inter-semibold text-[30px] leading-9 text-fg"
        />
        {taken ? (
          <Text variant="caption" tone="danger" className="pt-1">
            {t('custom.nameTaken')}
          </Text>
        ) : null}
      </View>

      <View className="mx-4 mt-5 h-90 rounded-[22px] bg-surface">
        <Text variant="caption" tone="subtle" className="absolute top-4 left-4 font-inter">
          {t('custom.tapMuscle')}
        </Text>
        <View className="flex-1 px-10 pt-9 pb-4">
          <MuscleMap
            view={view}
            selected={selected}
            onToggle={(part) => setMuscles((m) => toggleMuscle(m, part as MuscleId))}
            isSelectable={isMuscle}
          />
        </View>
        <View className="absolute right-3.5 bottom-3.5">
          <IconButton
            icon="refresh"
            haptic="select"
            className="bg-control"
            accessibilityLabel={t(view === 'front' ? 'custom.showBack' : 'custom.showFront')}
            onPress={() => setView((v) => (v === 'front' ? 'back' : 'front'))}
          />
        </View>
      </View>

      <View className="gap-3 px-4 pt-6">
        {selected.length ? (
          <>
            <SectionLabel label={t('custom.primary')} count={primary.length} accent />
            <View className="flex-row flex-wrap gap-2">{primary.map((m) => chip(m, true))}</View>
            <View className="pt-2">
              <SectionLabel label={t('custom.secondary')} count={secondary.length} />
            </View>
            <View className="flex-row flex-wrap gap-2">{secondary.map((m) => chip(m, false))}</View>
            <Text variant="caption" tone="subtle" className="font-inter">
              {t('custom.roleHint')}
            </Text>
          </>
        ) : (
          <Text variant="caption" tone="subtle" className="font-inter">
            {t('custom.noMuscles')}
          </Text>
        )}
      </View>

      <Text variant="overline" tone="subtle" className="px-4 pt-7 pb-2.5 text-xs">
        {t('custom.logs')}
      </Text>
      <View className="mx-4 rounded-[22px] bg-surface px-4 pt-4">
        <View className={cn(locked && 'opacity-35')} pointerEvents={locked ? 'none' : 'auto'}>
          <SegmentedControl
            value={timed ? 'time' : 'reps'}
            onChange={(v) => setTimed(v === 'time')}
            options={[
              { value: 'reps', label: t('custom.reps') },
              { value: 'time', label: t('custom.time') },
            ]}
          />
          <View className="mt-4 h-16 flex-row items-center justify-between border-t border-line">
            <Text variant="label" className="text-base">
              {t('custom.weight')}
            </Text>
            <ToggleSwitch
              value={weighted}
              onChange={setWeighted}
              accessibilityLabel={t('custom.weight')}
            />
          </View>
        </View>
      </View>
      {locked ? (
        <Text variant="caption" tone="subtle" className="px-4 pt-2.5 font-inter">
          {t('custom.locked')}
        </Text>
      ) : null}

      <Text variant="overline" tone="subtle" className="px-4 pt-7 pb-2.5 text-xs">
        {t('custom.rest')}
      </Text>
      <View className="mx-4 rounded-[22px] bg-surface px-4">
        <RestStepper value={rest} onChange={setRest} />
      </View>
    </Screen>
  );
}
