import { Stack } from 'expo-router';

import { InAppPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { colors } from '@/shared/lib/theme';

/**
 * A plan's page, and "Plan erstellen" from Today or Training: onboarding's plan flow, ending
 * back on the tab it was opened from.
 */
export default function PlanLayout() {
  return (
    <InAppPlanFlow>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </InAppPlanFlow>
  );
}
