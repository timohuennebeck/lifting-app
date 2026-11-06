import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';

import { asksSheets } from '../lib/steps';
import { choosesPlan, undatedCount, useWorkoutImportStore } from '../stores/workout-import-store';

/** The import's screens that count as steps (the checks have a counter of their own). */
export type ImportStep = 'start' | 'sheets' | 'dates' | 'imported' | 'plan';

/**
 * A screen's place in the import's counter, as far as the steps are known: in the app the start
 * screen is the first (in onboarding it ends the questions about the user), then the sheets of a
 * workbook with several, the dates when workouts have none, "Importiert", and how the plan is made
 * when the file has none.
 */
export function useImportStep(screen: ImportStep) {
  const { inApp } = usePlanFlow();
  const sheets = useWorkoutImportStore((s) => asksSheets(s.read));
  const dates = useWorkoutImportStore((s) => undatedCount(s) > 0);
  const plan = useWorkoutImportStore(choosesPlan);
  const steps = (
    [
      ['start', inApp],
      ['sheets', sheets],
      ['dates', dates],
      ['imported', true],
      ['plan', plan],
    ] as const
  ).flatMap(([step, shown]) => (shown ? [step] : []));
  return { step: steps.indexOf(screen) + 1, total: steps.length };
}
