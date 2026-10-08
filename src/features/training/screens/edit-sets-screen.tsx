import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { ExerciseId } from '@/shared/data/exercises';
import { newId } from '@/shared/data/json';
import {
  restSecondsFor,
  type TemplateExerciseDetail,
  useTemplateDetail,
} from '@/shared/data/templates';
import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { ToggleSwitch } from '@/shared/ui/toggle-switch';

import { RirPickerSheet } from '../components/rir-picker-sheet';
import { type SetDraft, SetEditorRow } from '../components/set-editor-row';
import { saveTemplateSets } from '../data/template-mutations';

const REST_STEP = 15;
const REST_MIN = 15;
const REST_MAX = 600;
const MAX_SETS = 10;

function EditHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between gap-3 px-4 py-1.5">
      <IconButton
        icon="close"
        accessibilityLabel={t('actions.close')}
        onPress={() => router.back()}
      />
      <View className="min-w-0 flex-1 items-center gap-0.5">
        <Text variant="label">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="size-[42px]" />
    </View>
  );
}

/** Edit target sets of one template exercise: reps range, RIR, rest override (00·P2 C·S). */
export function EditSetsScreen() {
  const { id, exerciseId } = useLocalSearchParams<{ id: string; exerciseId: string }>();
  const { t } = useTranslation('training');
  const { data: template } = useTemplateDetail(id);
  const exercise = template?.exercises.find((e) => e.id === exerciseId);
  if (!exercise) return <Screen header={<EditHeader title={t('sets.title')} />}>{null}</Screen>;
  return <EditSetsForm key={exercise.id} exercise={exercise} />;
}

function EditSetsForm({ exercise }: { exercise: TemplateExerciseDetail }) {
  const { t } = useTranslation(['training', 'common', 'exercises']);
  const [sets, setSets] = useState<SetDraft[]>(() =>
    exercise.sets.map((s) => ({
      key: s.id,
      repsMin: s.reps_min ?? 8,
      repsMax: s.reps_max ?? s.reps_min ?? 12,
      rir: s.rir ?? null,
    })),
  );
  const [rest, setRest] = useState<number | null>(exercise.restSeconds);
  const [rirIndex, setRirIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const defaultRest = restSecondsFor(exercise.exerciseId, null);
  const shownRest = rest ?? defaultRest;

  const patchSet = (index: number, patch: Partial<SetDraft>) =>
    setSets((all) => all.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const addSet = () =>
    setSets((all) => {
      const last = all[all.length - 1] ?? { repsMin: 8, repsMax: 12, rir: 2 };
      return [...all, { ...last, key: newId() }];
    });
  const stepRest = (delta: number) =>
    setRest((r) => clamp((r ?? defaultRest) + delta, REST_MIN, REST_MAX));

  const save = async () => {
    setSaving(true);
    try {
      await saveTemplateSets(
        requireUserId(),
        exercise.id,
        sets.map((s) => ({
          repsMin: Math.min(s.repsMin, s.repsMax),
          repsMax: Math.max(s.repsMin, s.repsMax),
          rir: s.rir,
        })),
        rest,
      );
      haptics.success();
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      scroll
      header={
        <EditHeader
          title={t('sets.title')}
          subtitle={t(`exercises:${exercise.exerciseId as ExerciseId}.name`)}
        />
      }
      footer={<Button label={t('common:actions.done')} loading={saving} onPress={save} />}
    >
      <View className="flex-row items-center gap-2.5 px-5 pt-6 pb-2">
        {(['set', 'min', 'max'] as const).map((key) => (
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
        ))}
        <Text variant="overline" className="w-7 text-right text-[11px] tracking-[0.9px] text-dim">
          {t('sets.rir')}
        </Text>
      </View>
      <View className="gap-2.5 px-5">
        {sets.map((set, i) => (
          <SetEditorRow
            key={set.key}
            index={i}
            set={set}
            onChange={(patch) => patchSet(i, patch)}
            onRirPress={() => setRirIndex(i)}
            onRemove={
              sets.length > 1 ? () => setSets((all) => all.filter((_, j) => j !== i)) : undefined
            }
          />
        ))}
      </View>
      <View className="flex-row px-5 pt-4">
        <IconButton
          icon="plus"
          size={40}
          iconSize={14}
          haptic="tap"
          className="bg-[#1E1E1E]"
          disabled={sets.length >= MAX_SETS}
          accessibilityLabel={t('sets.addSet')}
          onPress={addSet}
        />
      </View>

      <View className="mx-5 mt-[22px] gap-3.5 pt-5">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text variant="label" className="text-base">
              {t('sets.customRest')}
            </Text>
            <Text variant="caption" tone="subtle" className="mt-[3px] font-inter">
              {t('sets.customRestHint')}
            </Text>
          </View>
          <ToggleSwitch
            value={rest !== null}
            accessibilityLabel={t('sets.customRest')}
            onChange={(on) => setRest(on ? defaultRest : null)}
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
            className="bg-[#1E1E1E]"
            accessibilityLabel={t('common:actions.decrease')}
            disabled={shownRest <= REST_MIN}
            onPress={() => stepRest(-REST_STEP)}
          />
          <View className="flex-row items-baseline gap-1.5">
            <Text variant="headline" className="text-[26px] leading-[30px]">
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
            className="bg-[#1E1E1E]"
            accessibilityLabel={t('common:actions.increase')}
            disabled={shownRest >= REST_MAX}
            onPress={() => stepRest(REST_STEP)}
          />
        </View>
      </View>

      <RirPickerSheet
        visible={rirIndex !== null}
        value={rirIndex !== null ? (sets[rirIndex]?.rir ?? null) : null}
        onClose={() => setRirIndex(null)}
        onSelect={(rir) => {
          if (rirIndex !== null) patchSet(rirIndex, { rir });
          setRirIndex(null);
        }}
      />
    </Screen>
  );
}
