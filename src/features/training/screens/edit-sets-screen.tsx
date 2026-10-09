import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { defaultTargets, isTimed } from '@/shared/data/exercises';
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
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { ToggleSwitch } from '@/shared/ui/toggle-switch';

import { RirPickerSheet } from '../components/rir-picker-sheet';
import { type SetDraft, SetEditorRow } from '../components/set-editor-row';
import { saveTemplateSets } from '../data/template-mutations';

const REST_STEP = 15;
const REST_MIN = 15;
const REST_MAX = 600;
const MAX_SETS = 10;

/** Edit target sets of one template exercise: reps range, RIR, rest override (00·P2 C·S). */
export function EditSetsScreen() {
  const { id, exerciseId } = useLocalSearchParams<{ id: string; exerciseId: string }>();
  const { t } = useTranslation('training');
  const { data: template } = useTemplateDetail(id);
  const exercise = template?.exercises.find((e) => e.id === exerciseId);
  if (!exercise)
    return (
      <Screen header={<ScreenHeader icon="chevron-left" title={t('sets.title')} />}>{null}</Screen>
    );
  return <EditSetsForm key={exercise.id} exercise={exercise} />;
}

interface EditSetsFormProps {
  exercise: TemplateExerciseDetail;
}

function EditSetsForm({ exercise }: EditSetsFormProps) {
  const { t } = useTranslation(['training', 'common']);
  const timed = isTimed(exercise.exerciseId);
  const [sets, setSets] = useState<SetDraft[]>(() =>
    exercise.sets.map((s) => ({
      key: s.id,
      targetMin: s.target_min,
      targetMax: s.target_max,
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
      const fallback = defaultTargets(exercise.exerciseId);
      const last = all[all.length - 1] ?? {
        targetMin: fallback.min,
        targetMax: fallback.max,
        rir: fallback.rir,
      };
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
          targetMin: Math.min(s.targetMin, s.targetMax),
          targetMax: Math.max(s.targetMin, s.targetMax),
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
      // Title only, as in 00·P2 C·S; the exercise is known from the previous screen.
      header={<ScreenHeader icon="chevron-left" title={t('sets.title')} />}
      footer={<Button label={t('common:actions.done')} loading={saving} onPress={save} />}
    >
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
        <Text variant="overline" className="w-7 text-right text-[11px] tracking-[0.9px] text-dim">
          {timed ? '' : t('sets.rir')}
        </Text>
      </View>
      <View className="gap-2.5 px-5">
        {sets.map((set, i) => (
          <SetEditorRow
            key={set.key}
            index={i}
            set={set}
            timed={timed}
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
