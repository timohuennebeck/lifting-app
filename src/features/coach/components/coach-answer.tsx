import { View } from 'react-native';
import Animated, { FadeIn, LayoutAnimationConfig } from 'react-native-reanimated';

import { CoachMark } from '@/shared/ui/coach-mark';
import type { CoachChart } from '../lib/charts';
import { AnswerText } from './answer-text';
import { CalendarChart } from './charts/calendar-chart';
import { CompareChart } from './charts/compare-chart';
import { DistributionChart } from './charts/distribution-chart';
import { PeriodChart } from './charts/period-chart';
import { TrendChart } from './charts/trend-chart';

/** The chart under an answer, by its kind. */
function AnswerChart({ chart }: { chart: CoachChart }) {
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

/**
 * One answer: the coach's mark, the text and, mostly, a chart under it. A chart added to an answer
 * on screen (once its text is complete) fades in; one there from the start just shows.
 */
export function CoachAnswer({ text, chart }: { text: string; chart: CoachChart | null }) {
  return (
    <View className="flex-row gap-2.5">
      <CoachMark />
      <View className="min-w-0 flex-1 gap-4">
        <AnswerText text={text} />
        <LayoutAnimationConfig skipEntering>
          {chart ? (
            <Animated.View entering={FadeIn.duration(250)}>
              <AnswerChart chart={chart} />
            </Animated.View>
          ) : null}
        </LayoutAnimationConfig>
      </View>
    </View>
  );
}
