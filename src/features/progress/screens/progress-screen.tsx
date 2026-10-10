import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BodyView } from '@/features/body/components/body-view';
import { MusclesView } from '@/features/muscles/components/muscles-view';
import { TabScreen } from '@/shared/components/tab-screen';
import { Text } from '@/shared/ui/text';
import { UnderlineTabs } from '@/shared/ui/underline-tabs';

import { ExerciseRecordsList } from '../components/exercise-records-list';
import { type ProgressView, useProgressStore } from '../stores/progress-store';

const VIEWS: ProgressView[] = ['exercises', 'muscles', 'body'];

/** Progress tab: exercises with their records, trained muscles and body checks, one at a time. */
export function ProgressScreen() {
  const { t } = useTranslation();
  const view = useProgressStore((s) => s.view);
  const setView = useProgressStore((s) => s.setView);

  return (
    <TabScreen
      // The exercise list scrolls on its own, under the pinned title and tabs.
      scroll={view !== 'exercises'}
      pinned={
        <View>
          <Text variant="title" className="px-5 pt-5 normal-case">
            {t('progressTab.title')}
          </Text>
          <UnderlineTabs
            className="mx-4 mt-3"
            tabs={VIEWS.map((key) => ({ key, label: t(`progressTab.${key}`) }))}
            value={view}
            onChange={setView}
          />
        </View>
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
