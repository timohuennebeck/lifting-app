import { PagerPage } from '@/shared/components/pager-page';

import { FeedbackList } from '../components/feedback-list';

/** Profile, "Feedback": the user's tickets and a way to start a new one. */
export function FeedbackPage() {
  return (
    <PagerPage>
      <FeedbackList />
    </PagerPage>
  );
}
