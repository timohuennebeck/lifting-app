import type { OnboardingDraft } from '@/features/onboarding/stores/onboarding-store';
import type { Experience, Split } from '@/shared/data/profile';

/**
 * The splits that suit each number of workouts a week, the recommended one first: those that
 * train every muscle at least twice a week lead where the week allows it. With one option the
 * question is left out.
 */
const BY_SESSIONS: Record<number, Split[]> = {
  1: ['full_body'],
  2: ['full_body', 'upper_lower'],
  3: ['full_body', 'ppl'],
  4: ['upper_lower', 'full_body'],
  5: ['ppl_upper_lower', 'bro'],
  6: ['ppl', 'upper_lower', 'arnold'],
  // Push/pull/legs twice and a lighter full-body day.
  7: ['ppl'],
};

const SEASONED: (Experience | null)[] = ['intermediate', 'advanced'];

/** The splits to offer for `sessionsPerWeek`, the recommended one first. */
export function splitsFor(sessionsPerWeek: number, experience: Experience | null): Split[] {
  // Three a week: full body to start with, push/pull/legs once the basics are there.
  if (sessionsPerWeek === 3 && SEASONED.includes(experience)) return ['ppl', 'full_body'];
  return BY_SESSIONS[sessionsPerWeek] ?? ['full_body'];
}

/** The split the plan is made with: the one picked while it suits the week, else the recommended. */
export function chosenSplit(
  draft: Pick<OnboardingDraft, 'split' | 'sessionsPerWeek' | 'experience'>,
): Split {
  const options = splitsFor(draft.sessionsPerWeek, draft.experience);
  return draft.split && options.includes(draft.split) ? draft.split : options[0];
}
