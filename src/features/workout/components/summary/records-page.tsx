import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import type { UnitSystem } from '@/shared/lib/format';

import type { WorkoutRecord } from '../../data/workout-records';
import { RecordCard } from '../record-card';
import { StoryTitle, storyAccent } from './story-title';

export interface RecordsPageProps {
  records: WorkoutRecord[];
  units: UnitSystem;
  bottomInset: number;
  /** Scrolling started: the user is reading. */
  onRead: () => void;
}

/** Story page 3, only after new records: how many, then each with the best set before it. */
export function RecordsPage({ records, units, bottomInset, onRead }: RecordsPageProps) {
  const { t } = useTranslation('workout');
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      onScrollBeginDrag={onRead}
    >
      <View className="px-5 pt-8">
        <StoryTitle overline={t('summary.story.recordsOverline')}>
          <Trans
            t={t}
            i18nKey="summary.story.recordsTitle"
            count={records.length}
            values={{ count: records.length }}
            components={{ accent: storyAccent }}
          />
        </StoryTitle>
      </View>
      <View className="gap-2.5 px-5 pt-7">
        {records.map((r) => (
          <RecordCard key={r.exerciseId} record={r} units={units} />
        ))}
      </View>
    </ScrollView>
  );
}
