import { Stack } from 'expo-router';

import { InAppPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { colors } from '@/shared/lib/theme';

/**
 * "Plan erstellen" from the "+" sheet or Training: onboarding's plan flow, ending on Training.
 * No swiping back, so an edge swipe can't drop the plan by accident: the header's buttons go back.
 */
export default function PlanLayout() {
  return (
    <InAppPlanFlow>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* Reading a file: Android's back asks before it stops. */}
        <Stack.Screen name="import/reading" options={{ animation: 'fade' }} />
      </Stack>
    </InAppPlanFlow>
  );
}
