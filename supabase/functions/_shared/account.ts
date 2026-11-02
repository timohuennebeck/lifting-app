// What the AI functions check about the user before calling OpenAI: their age and whether they
// have Loqqa Pro (assess-progress, coach-chat). Importing it touches no Deno API, so the plain
// modules that only need `ageFrom` stay testable outside the Edge runtime.

/** RevenueCat entitlement that unlocks Loqqa Pro (same as the app). */
const PRO_ENTITLEMENT = 'pro';

/**
 * Whole years someone born on `birthDate` (YYYY-MM-DD) is on `today`, as the app counts them
 * (`ageFrom` in src/shared/data/profile.ts), here on the UTC date.
 */
export function ageFrom(birthDate: string, today: Date) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const todayMonth = today.getUTCMonth() + 1;
  const hadBirthday = todayMonth > month || (todayMonth === month && today.getUTCDate() >= day);
  return today.getUTCFullYear() - year - (hadBirthday ? 0 : 1);
}

/**
 * Whether RevenueCat lists an active Pro entitlement for the user. Without a key (local
 * development) or when RevenueCat can't be reached it lets the request through: the app shows
 * the paywall itself, this only keeps the OpenAI cost to paying users.
 */
export async function hasPro(userId: string) {
  const key = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!key) return true;
  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      console.error('Checking Pro with RevenueCat failed', response.status, await response.text());
      return true;
    }
    const entitlement = (await response.json()).subscriber?.entitlements?.[PRO_ENTITLEMENT];
    if (!entitlement) return false;
    // No expiry date = lifetime.
    return entitlement.expires_date === null || Date.parse(entitlement.expires_date) > Date.now();
  } catch (error) {
    console.error('Checking Pro with RevenueCat failed', error);
    return true;
  }
}
