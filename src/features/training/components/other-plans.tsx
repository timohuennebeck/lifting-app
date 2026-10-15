import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import type { PlanSummary } from '@/shared/data/plans';
import type { RoutineSummary } from '@/shared/data/routines';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';

import { useStartRoutine } from '../hooks/use-start-routine';
import { RoutineRow, useRoutineMeta } from './routine-row';
import { SectionTitle } from './section-title';

export interface OtherPlansProps {
  /** The plans Today doesn't follow, in their order. */
  plans: PlanSummary[];
  routines: RoutineSummary[];
}

/** The other plans as chips, one at a time with its routines and a way to its page. */
export function OtherPlans({ plans, routines }: OtherPlansProps) {
  const { t } = useTranslation('training');
  const meta = useRoutineMeta();
  const { start, startingId } = useStartRoutine();
  const [picked, setPicked] = useState<string | null>(null);
  const plan = plans.find((p) => p.id === picked) ?? plans[0];
  if (!plan) return null;
  const planRoutines = routines.filter((r) => r.planId === plan.id);

  return (
    <>
      <SectionTitle>{t('list.otherPlans')}</SectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // A horizontal ScrollView grows by default; this one is as tall as its chips.
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerClassName="gap-2 px-4"
      >
        {plans.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            count={p.routineCount}
            selected={p.id === plan.id}
            onPress={() => setPicked(p.id)}
          />
        ))}
      </ScrollView>
      <View className="gap-2 px-4 pt-3">
        {planRoutines.map((routine) => (
          <RoutineRow
            key={routine.id}
            name={routine.name}
            items={routine.items}
            meta={meta(routine)}
            starting={startingId === routine.id}
            onPress={() => router.push(`/routine/${routine.id}`)}
            // An empty routine has nothing to start: play opens it to add exercises.
            onStart={() =>
              routine.exerciseCount ? start(routine) : router.push(`/routine/${routine.id}`)
            }
          />
        ))}
        <Button
          label={t('myPlan.openPlanNamed', { name: plan.name })}
          variant="secondary"
          size="md"
          onPress={() => router.push(`/plan/${plan.id}`)}
        />
      </View>
    </>
  );
}
