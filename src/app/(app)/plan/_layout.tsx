import { Stack } from 'expo-router';

import { InAppPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { colors } from '@/shared/lib/theme';

/** Training → "Programm erstellen": onboarding's plan flow, ending back on Training. */
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
