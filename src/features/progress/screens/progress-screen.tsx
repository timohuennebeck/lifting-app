import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BodyView } from '@/features/body/components/body-view';
import { MusclesView } from '@/features/muscles/components/muscles-view';
import { TabScreen } from '@/shared/components/tab-screen';
import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

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
      // The exercise list scrolls on its own, under the pinned title and pills.
      scroll={view !== 'exercises'}
      pinned={
        <View>
          <Text variant="title" className="px-5 pt-5 normal-case">
            {t('progressTab.title')}
          </Text>
          <View className="flex-row gap-1.5 px-5 pt-4" accessibilityRole="tablist">
            {VIEWS.map((key) => {
              const active = key === view;
              return (
                <PressableScale
                  key={key}
                  haptic="select"
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  onPress={() => setView(key)}
                  className={cn(
                    'h-9 justify-center rounded-full px-3.5',
                    active ? 'bg-accent' : 'bg-surface',
                  )}
                >
                  <Text
                    variant="caption"
                    tone={active ? 'onAccent' : 'secondary'}
                    className="text-sm"
                  >
                    {t(`progressTab.${key}`)}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
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
