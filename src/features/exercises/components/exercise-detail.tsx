import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { type ExerciseId, getExercise } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { useExerciseHistory } from '@/shared/data/workouts';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { MUSCLE_CARDS, MuscleMap } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { exerciseMuscles, primaryGroup } from '../lib/muscle-groups';
import { TECHNIQUE_OF } from '../lib/technique';
import { ExerciseHistoryList } from './exercise-history-list';
import { ExerciseThumb } from './exercise-thumb';

export interface ExerciseDetailProps {
  exerciseId: string;
  onClose: () => void;
  /** Extra top padding for the close button, e.g. the status bar inset. */
  topInset?: number;
}

type Tab = 'exercise' | 'history';

/** Exercise detail (design 06e): photo, worked muscles, technique steps and history. */
export function ExerciseDetail({ exerciseId, onClose, topInset = 0 }: ExerciseDetailProps) {
  const { t } = useTranslation(['exercises', 'muscles', 'common']);
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('exercise');
  const exercise = getExercise(exerciseId);
  const units = useUnits();
  const history = useExerciseHistory(exerciseId).data ?? [];
  if (!exercise) return null;

  const id = exerciseId as ExerciseId;
  const name = t(`exercises:${id}.name`);
  const muscles = exerciseMuscles(id);
  const steps = t(`exercises:technique.${TECHNIQUE_OF[id]}`, { returnObjects: true });
  const view = muscles[0] ? MUSCLE_CARDS[muscles[0]].view : 'front';

  return (
    <View className="flex-1 bg-bg">
      <View className="h-[340px] overflow-hidden">
        {exercise.image ? (
          <Image
            source={exercise.image}
            contentFit="cover"
            contentPosition={{ left: '50%', top: '35%' }}
            style={[StyleSheet.absoluteFill, { bottom: 24 }]}
          />
        ) : (
          <ExerciseThumb
            exerciseId={id}
            name={name}
            className="absolute inset-0 h-auto w-auto rounded-none"
            initialsClassName="text-[64px] leading-[64px]"
          />
        )}
        <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.bg} stopOpacity={0.55} />
              <Stop offset="0.25" stopColor={colors.bg} stopOpacity={0} />
              <Stop offset="0.45" stopColor={colors.bg} stopOpacity={0} />
              <Stop offset="0.92" stopColor={colors.bg} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#hero-fade)" />
        </Svg>
        <View className="absolute left-4" style={{ top: topInset + 16 }}>
          <IconButton
            icon="close"
            accessibilityLabel={t('common:actions.close')}
            onPress={onClose}
          />
        </View>
        <View className="absolute right-5 bottom-1.5 left-5">
          <Text variant="headline" className="text-[30px] leading-[32px]">
            {name}
          </Text>
          <Text variant="label" tone="muted" className="mt-2 font-inter">
            {`${t(`exercises:equipment.${exercise.equipment}`)} · ${t(`exercises:groups.${primaryGroup(id)}`)}`}
          </Text>
        </View>
      </View>
      <View className="mx-4 mt-3 flex-row border-b border-control">
        {(['exercise', 'history'] as const).map((key) => (
          <PressableScale
            key={key}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            onPress={() => setTab(key)}
            className={cn(
              'h-[46px] flex-1 items-center justify-center',
              tab === key && 'border-b-2 border-accent',
            )}
          >
            <Text variant="label" tone={tab === key ? 'default' : 'subtle'}>
              {t(`exercises:detail.tabs.${key}`)}
            </Text>
          </PressableScale>
        ))}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pt-7"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'exercise' ? (
          <>
            <View className="flex-row items-center gap-1">
              <View className="min-w-0 flex-1 flex-row flex-wrap gap-1.5">
                {muscles.map((m, i) => (
                  <View
                    key={m}
                    className={cn(
                      'h-[34px] justify-center rounded-full px-3.5',
                      i === 0 ? 'bg-accent' : 'bg-elevated',
                    )}
                  >
                    <Text variant="caption" tone={i === 0 ? 'onAccent' : 'default'}>
                      {t(`muscles:names.${m}`)}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="h-[180px] w-[110px]">
                <MuscleMap view={view} selected={muscles} width={110} height={180} />
              </View>
            </View>
            <View>
              <Text variant="overline" tone="subtle" className="pb-1">
                {t('exercises:detail.technique')}
              </Text>
              {steps.map((step, i) => (
                <View key={i} className="flex-row gap-3.5 py-2.5">
                  <View className="size-[30px] items-center justify-center rounded-full bg-elevated">
                    <Text variant="caption" className="text-sm">
                      {i + 1}
                    </Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text variant="bodyStrong" className="text-base">
                      {step.title}
                    </Text>
                    <Text variant="paragraph" tone="muted" className="mt-1 text-sm leading-5">
                      {step.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : history.length ? (
          <ExerciseHistoryList entries={history} units={units} />
        ) : (
          <View className="items-center gap-2 py-10">
            <Text variant="bodyStrong">{t('exercises:detail.noHistory')}</Text>
            <Text variant="paragraph" tone="subtle" className="text-center">
              {t('exercises:detail.noHistoryHint')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
