import { TabScreen } from '@/shared/components/tab-screen';

import { BodyView } from '../components/body-view';

/** Körper tab: the progress checks, their photos and the body score. */
export function BodyScreen() {
  return (
    <TabScreen>
      <BodyView />
    </TabScreen>
  );
}
