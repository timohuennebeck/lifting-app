import { getLocales } from 'expo-localization';

/**
 * Minimum ages above the default, by the phone's region (ISO 3166-1): the age from which someone
 * may consent to the app's data processing on their own (GDPR Art. 8 per EU/EEA country; PIPA in
 * South Korea).
 */
const MINIMUM_AGES: Record<string, number> = {
  AT: 14,
  BG: 14,
  CY: 14,
  ES: 14,
  IT: 14,
  LT: 14,
  KR: 14,
  CZ: 15,
  FR: 15,
  GR: 15,
  SI: 15,
  DE: 16,
  HR: 16,
  HU: 16,
  IE: 16,
  LI: 16,
  LU: 16,
  NL: 16,
  PL: 16,
  RO: 16,
  SK: 16,
};

/** Everywhere else, e.g. the GDPR's lowest age, COPPA in the USA and the app stores' floor. */
const DEFAULT_MINIMUM_AGE = 13;

/** The youngest age the app accepts for the phone's region; the profile's database check uses 13. */
export function minimumAge() {
  const region = getLocales()[0]?.regionCode?.toUpperCase();
  return (region && MINIMUM_AGES[region]) || DEFAULT_MINIMUM_AGE;
}
