import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { PagerPage } from '@/shared/components/pager-page';
import { useCurrentPlan, usePlanStatus } from '@/shared/data/plans';
import { useRoutines, useWeekDone } from '@/shared/data/routines';
import { formatDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

import { ActivePlanCard } from '../components/active-plan-card';
import { OtherPlans } from '../components/other-plans';
import { RoutineRow, useRoutineMeta } from '../components/routine-row';
import { SectionTitle } from '../components/section-title';
import { useStartRoutine } from '../hooks/use-start-routine';

/**
 * "Mein Plan" on the Training tab: the plan Today follows with where it stands and the routine
 * the coach recommends, its other routines (done this week or not), then the other plans.
 */
export function MyPlanPage() {
  const { t } = useTranslation('training');
  const { data: routines = [] } = useRoutines();
  const { plan, plans, profile, isLoading } = useCurrentPlan();
  const status = usePlanStatus(plan);
  const { data: doneThisWeek = {} } = useWeekDone(plan?.id, status?.week);
  const { start, startingId } = useStartRoutine();
  const meta = useRoutineMeta();

  const planRoutines = plan ? routines.filter((r) => r.planId === plan.id) : [];
  const next = planRoutines.find((r) => r.id === status?.nextRoutineId);
  const rest = planRoutines.filter((r) => r !== next);
  const otherPlans = plans.filter((p) => p.id !== plan?.id);

  return (
    <PagerPage>
      {plan ? (
        <>
          <SectionTitle>{t('myPlan.active')}</SectionTitle>
          <ActivePlanCard
            plan={plan}
            status={status}
            next={next}
            starting={!!next && startingId === next.id}
            onStart={start}
          />
          {rest.length ? (
            <>
              <SectionTitle>{t('myPlan.rest')}</SectionTitle>
              <View className="gap-2 px-4">
                {rest.map((routine) => {
                  const doneAt = doneThisWeek[routine.id];
                  return (
                    <RoutineRow
                      key={routine.id}
                      name={routine.name}
                      items={routine.items}
                      meta={
                        doneAt
                          ? t('myPlan.doneOn', {
                              day: formatDate(new Date(doneAt), { weekday: 'short' }),
                            })
                          : meta(routine)
                      }
                      done={!!doneAt}
                      starting={startingId === routine.id}
                      onPress={() => router.push(`/routine/${routine.id}`)}
                      // An empty routine has nothing to start: play opens it to add exercises.
                      onStart={() =>
                        routine.exerciseCount
                          ? start(routine)
                          : router.push(`/routine/${routine.id}`)
                      }
                    />
                  );
                })}
              </View>
            </>
          ) : null}
        </>
      ) : !isLoading ? (
        <Card className="mx-4 mt-6 items-center gap-4 py-7">
          <View className="items-center gap-2">
            <Text variant="headline" className="text-center">
              {t('list.noPlan')}
            </Text>
            <Text variant="paragraph" tone="subtle" className="text-center">
              {t('list.noPlanHint')}
            </Text>
          </View>
          <Button
            label={t('create.createPlan')}
            icon="plus"
            size="md"
            variant="secondary"
            onPress={() => openPlanFlow(profile, '/training')}
          />
        </Card>
      ) : null}

      {otherPlans.length ? <OtherPlans plans={otherPlans} routines={routines} /> : null}
      {/* The list ends 40pt above the tab bar inset; PagerPage adds 24. */}
      <View className="h-4" />
    </PagerPage>
  );
}
