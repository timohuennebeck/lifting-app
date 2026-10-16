import type { OnboardingDraft } from '@/features/onboarding/stores/onboarding-store';
import { clampSessions } from '@/shared/data/plans';
import type { Experience, Split } from '@/shared/data/profile';

/**
 * The splits that suit each number of workouts a week, the recommended one first: those that
 * train every muscle twice a week lead. The bro split (each muscle once) is offered, never
 * recommended.
 */
const BY_SESSIONS: Record<number, Split[]> = {
  2: ['full_body', 'upper_lower'],
  3: ['full_body', 'upper_lower_full', 'ppl'],
  4: ['upper_lower', 'full_body', 'ppl_arms'],
  5: ['ppl_upper_lower', 'full_body', 'bro'],
  6: ['ppl', 'upper_lower', 'arnold', 'full_body'],
};

const SEASONED: (Experience | null)[] = ['intermediate', 'advanced'];

/** The splits to offer for `sessionsPerWeek`, the recommended one first. */
export function splitsFor(sessionsPerWeek: number, experience: Experience | null): Split[] {
  // Three a week: full body to start with, upper/lower/full body once the basics are there.
  if (sessionsPerWeek === 3 && SEASONED.includes(experience)) {
    return ['upper_lower_full', 'full_body', 'ppl'];
  }
  return BY_SESSIONS[clampSessions(sessionsPerWeek)];
}

/**
 * The split the plan is made with: the one picked while it suits the week; null for "Keine
 * Präferenz" (the AI picks), also when the picked one no longer suits.
 */
export function chosenSplit(
  draft: Pick<OnboardingDraft, 'split' | 'sessionsPerWeek' | 'experience'>,
): Split | null {
  const options = splitsFor(draft.sessionsPerWeek, draft.experience);
  return draft.split && options.includes(draft.split) ? draft.split : null;
}
