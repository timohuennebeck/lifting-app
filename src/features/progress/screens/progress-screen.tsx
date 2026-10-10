import { useTranslation } from 'react-i18next';

import { BodyView } from '@/features/body/components/body-view';
import { useNextCheck } from '@/features/body/hooks/use-next-check';
import { MusclesView } from '@/features/muscles/components/muscles-view';
import { TabScreen } from '@/shared/components/tab-screen';
import { UnderlineTabs } from '@/shared/ui/underline-tabs';

import { type ProgressView, useProgressStore } from '../stores/progress-store';

const VIEWS: ProgressView[] = ['muscles', 'body'];

/** Progress tab: trained muscles and body checks, one at a time (records are in the search). */
export function ProgressScreen() {
  const { t } = useTranslation();
  const view = useProgressStore((s) => s.view);
  const setView = useProgressStore((s) => s.setView);
  // A due body check shows as a badge with 1 on "Körper".
  const { due } = useNextCheck();

  return (
    <TabScreen
      pinned={
        <UnderlineTabs
          className="mx-4 mt-3"
          tabs={VIEWS.map((key) => ({
            key,
            label: t(`progressTab.${key}`),
            badge: key === 'body' && due ? 1 : undefined,
          }))}
          value={view}
          onChange={setView}
        />
      }
    >
      {view === 'muscles' ? <MusclesView /> : <BodyView />}
    </TabScreen>
  );
}
