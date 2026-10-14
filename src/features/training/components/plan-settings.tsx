import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  BLOCK_OPTIONS,
  MAX_SESSIONS_PER_WEEK,
  type PlanStatus,
  type PlanSummary,
} from '@/shared/data/plans';
import { attempt } from '@/shared/lib/async';
import { Button } from '@/shared/ui/button';
import { CompactStepper } from '@/shared/ui/compact-stepper';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';

import { deloadNow, restartBlock, setBlockWeeks, setSessionsPerWeek } from '../data/plan-mutations';
import { SectionTitle } from './section-title';

interface SettingProps {
  title: string;
  hint: string;
  children: ReactNode;
}

/** A setting of the plan: overline, the control on a card, a line on what it does. */
function Setting({ title, hint, children }: SettingProps) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <View className="mx-4 rounded-[22px] bg-surface px-4 py-3">{children}</View>
      <Text variant="caption" tone="subtle" className="px-5 pt-2 font-inter">
        {hint}
      </Text>
    </>
  );
}

interface GoalStepperProps {
  planId: string;
  value: number;
}

/**
 * The weekly goal. It counts on from what was tapped, so quick taps add up before they are
 * saved: saved values on the way back don't reset it until the last one tapped arrives.
 */
function GoalStepper({ planId, value }: GoalStepperProps) {
  const { t } = useTranslation('training');
  const [goal, setGoal] = useState(value);
  const [stored, setStored] = useState(value);
  const [sent, setSent] = useState<number | null>(null);
  if (value !== stored) {
    setStored(value);
    if (sent === null || value === sent) {
      setGoal(value);
      setSent(null);
    }
  }
  return (
    <CompactStepper
      value={goal}
      min={1}
      max={MAX_SESSIONS_PER_WEEK}
      label={t('plan.perWeek')}
      onChange={async (count) => {
        setGoal(count);
        setSent(count);
        const saved = await attempt('Saving the weekly goal failed', () =>
          setSessionsPerWeek(planId, count),
        );
        if (!saved) {
          setGoal(value);
          setSent(null);
        }
      }}
    />
  );
}

export interface PlanSettingsProps {
  plan: PlanSummary;
  /** Undefined while it loads. */
  status: PlanStatus | undefined;
}

/** A plan's weekly goal and its blocks, with a deload or a new block started now. */
export function PlanSettings({ plan, status }: PlanSettingsProps) {
  const { t } = useTranslation('training');
  // Block settings count from the week the plan is in now, so they wait until it is known.
  const week = status?.week;
  const changeBlocks = (change: (planWeek: number) => Promise<unknown>) => {
    if (week !== undefined) void attempt('Saving the blocks failed', () => change(week));
  };
  const blockOptions = [
    { value: 0, label: t('plan.blockOff') },
    ...BLOCK_OPTIONS.map((weeks) => ({
      value: weeks,
      label: t('plan.blockOption', { build: weeks - 1 }),
    })),
  ];

  return (
    <>
      <Setting title={t('plan.perWeek')} hint={t('plan.perWeekHint')}>
        <GoalStepper planId={plan.id} value={plan.sessionsPerWeek} />
      </Setting>

      <Setting title={t('plan.blocks')} hint={t('plan.blocksHint')}>
        <SegmentedControl
          options={blockOptions}
          value={plan.blockWeeks ?? 0}
          disabled={week === undefined}
          onChange={(weeks) =>
            changeBlocks((planWeek) => setBlockWeeks(plan.id, weeks || null, planWeek))
          }
        />
        {plan.blockWeeks ? (
          <View className="flex-row gap-2 pt-3">
            {!status?.deload ? (
              <Button
                label={t('plan.deloadNow')}
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={week === undefined}
                onPress={() => changeBlocks((planWeek) => deloadNow(plan.id, planWeek))}
              />
            ) : null}
            <Button
              label={t('plan.restartBlock')}
              variant="secondary"
              size="sm"
              className="flex-1"
              disabled={week === undefined}
              onPress={() => changeBlocks((planWeek) => restartBlock(plan.id, planWeek))}
            />
          </View>
        ) : null}
      </Setting>
    </>
  );
}
