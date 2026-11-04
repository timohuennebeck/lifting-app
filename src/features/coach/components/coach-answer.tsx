import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, LayoutAnimationConfig } from 'react-native-reanimated';

import { CoachMark } from '@/shared/ui/coach-mark';
import type { CoachChart, WorkoutChart } from '../lib/charts';
import { AnswerText } from './answer-text';
import { CalendarChart } from './charts/calendar-chart';
import { CompareChart } from './charts/compare-chart';
import { DistributionChart } from './charts/distribution-chart';
import { PeriodChart } from './charts/period-chart';
import { TrendChart } from './charts/trend-chart';
import { WorkoutCard } from './workout-card';

/** The chart under an answer, by its kind. */
function AnswerChart({ chart }: { chart: Exclude<CoachChart, WorkoutChart> }) {
  switch (chart.type) {
    case 'trend':
      return <TrendChart chart={chart} />;
    case 'compare':
      return <CompareChart chart={chart} />;
    case 'period_vs_average':
      return <PeriodChart chart={chart} />;
    case 'calendar':
      return <CalendarChart chart={chart} />;
    case 'distribution':
      return <DistributionChart chart={chart} />;
  }
}

/** Added to an answer on screen (once its text is complete) it fades in; there from the start it just shows. */
function Arriving({ children }: { children: ReactNode }) {
  return (
    <LayoutAnimationConfig skipEntering>
      {children ? <Animated.View entering={FadeIn.duration(250)}>{children}</Animated.View> : null}
    </LayoutAnimationConfig>
  );
}

export interface CoachAnswerProps {
  /** The saved answer's id. */
  id: string;
  text: string;
  chart: CoachChart | null;
}

/**
 * One answer: the coach's mark, the text and, mostly, a chart under it; or a workout, which takes
 * the page's whole width as on the Training tab.
 */
export function CoachAnswer({ id, text, chart }: CoachAnswerProps) {
  const workout = chart?.type === 'workout' ? chart : null;
  const drawn = chart?.type === 'workout' ? null : chart;
  return (
    <View className="gap-4">
      <View className="flex-row gap-2.5">
        <CoachMark />
        <View className="min-w-0 flex-1 gap-4">
          <AnswerText text={text} />
          <Arriving>{drawn ? <AnswerChart chart={drawn} /> : null}</Arriving>
        </View>
      </View>
      <Arriving>{workout ? <WorkoutCard answerId={id} workout={workout} /> : null}</Arriving>
    </View>
  );
}
