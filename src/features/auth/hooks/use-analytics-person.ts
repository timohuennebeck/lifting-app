import { useEffect } from 'react';

import { useIsPro } from '@/features/paywall/stores/subscription-store';
import { useCurrentPlan } from '@/shared/data/plans';
import { ageFrom } from '@/shared/data/profile';
import { ageGroupOf, identify, type PersonProperties } from '@/shared/lib/posthog';

/**
 * Keeps the signed-in person's PostHog properties up to date: their answers, plan and Pro
 * status, never body data. Sent again only when one of them changes.
 */
export function useAnalyticsPerson() {
  const { plan, profile } = useCurrentPlan();
  const isPro = useIsPro();
  const userId = profile?.id;
  const person: PersonProperties | null = profile
    ? {
        goal: profile.goal,
        experience: profile.experience,
        sessions_per_week: plan?.sessionsPerWeek ?? null,
        split: profile.split,
        equipment: profile.equipment,
        language: profile.language,
        unit_preference: profile.unitPreference,
        age_group: ageGroupOf(profile.birthDate ? ageFrom(profile.birthDate) : null),
        is_pro: isPro,
      }
    : null;
  // Compared as text: `person` is a new object on every render.
  const key = person ? JSON.stringify(person) : null;
  useEffect(() => {
    if (userId && key) identify(userId, JSON.parse(key) as PersonProperties);
  }, [userId, key]);
}
