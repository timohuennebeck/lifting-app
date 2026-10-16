import { TabScreen } from '@/shared/components/tab-screen';

import { MusclesView } from '../components/muscles-view';

/** Level tab: how each muscle was trained. */
export function LevelScreen() {
  return (
    <TabScreen>
      <MusclesView />
    </TabScreen>
  );
}
