import { router } from 'expo-router';

/** Set by the entry screen that opened the calendar to pick its day; called once. */
let onPick: ((date: string) => void) | null = null;

/** Opens the calendar to pick a day; `callback` gets the day tapped there. */
export function pickDate(callback: (date: string) => void) {
  onPick = callback;
  router.push({ pathname: '/body-weight/calendar', params: { pick: '1' } });
}

/** The calendar's side: hands the tapped day to the entry screen and goes back to it. */
export function returnPickedDate(date: string) {
  const callback = onPick;
  onPick = null;
  callback?.(date);
  router.back();
}
