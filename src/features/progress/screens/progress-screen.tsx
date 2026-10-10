import { useTranslation } from 'react-i18next';

import { BodyView } from '@/features/body/components/body-view';
import { useNextCheck } from '@/features/body/hooks/use-next-check';
import { MusclesView } from '@/features/muscles/components/muscles-view';
import { TabScreen } from '@/shared/components/tab-screen';
import { UnderlineTabs } from '@/shared/ui/underline-tabs';

import { ExerciseRecordsList } from '../components/exercise-records-list';
import { type ProgressView, useProgressStore } from '../stores/progress-store';

const VIEWS: ProgressView[] = ['exercises', 'muscles', 'body'];

/** Progress tab: exercises with their records, trained muscles and body checks, one at a time. */
export function ProgressScreen() {
  const { t } = useTranslation();
  const view = useProgressStore((s) => s.view);
  const setView = useProgressStore((s) => s.setView);
  // A due body check shows as a dot on "Körper".
  const { due } = useNextCheck();

  return (
    <TabScreen
      // The exercise list scrolls on its own, under the pinned tabs.
      scroll={view !== 'exercises'}
      pinned={
        <UnderlineTabs
          className="mx-4 mt-3"
          tabs={VIEWS.map((key) => ({
            key,
            label: t(`progressTab.${key}`),
            dot: key === 'body' && due,
          }))}
          value={view}
          onChange={setView}
        />
      }
    >
      {view === 'exercises' ? (
        <ExerciseRecordsList />
      ) : view === 'muscles' ? (
        <MusclesView />
      ) : (
        <BodyView />
      )}
    </TabScreen>
  );
}
