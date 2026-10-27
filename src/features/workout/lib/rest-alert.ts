import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** One rest alert at a time: a new one replaces it, also in the Notification Centre. */
const ID = 'rest-end';
/** Android's channel for it, which carries the sound and vibration there. */
const CHANNEL = 'rest-end';

// While the app is open it vibrates and chimes itself (useRestTimer), so the alert stays hidden.
Notifications.setNotificationHandler({
  handleNotification: async ({ request }) => {
    const shown = request.identifier !== ID;
    return {
      shouldShowBanner: shown,
      shouldShowList: shown,
      shouldPlaySound: shown,
      shouldSetBadge: false,
    };
  },
});

export interface RestAlertTexts {
  title: string;
  body: string;
  /** The Android channel's name, in the system settings. */
  channel: string;
}

/** Scheduling and cancelling run in order, so a cancel can't overtake the schedule before it. */
let queue: Promise<unknown> = Promise.resolve();
const enqueue = (task: () => Promise<unknown>) => {
  queue = queue.then(task).catch((error) => console.warn('The rest alert failed', error));
};

/** Whether alerts may show: asks the first time (at the first rest). */
async function allowed() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Alerts at `endsAt` while the app isn't open. With `sound` it plays the default sound, which
 * also vibrates (and only vibrates on silent); without it, it shows silently. Without permission
 * it does nothing.
 */
export function scheduleRestAlert(endsAt: number, texts: RestAlertTexts, sound: boolean) {
  enqueue(async () => {
    if (!(await allowed())) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: texts.channel,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 200, 400],
      });
    }
    await Notifications.scheduleNotificationAsync({
      identifier: ID,
      content: { title: texts.title, body: texts.body, sound: sound ? 'default' : false },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: endsAt,
        channelId: CHANNEL,
      },
    });
  });
}

/** Takes back the alert of a rest that was skipped or moved. */
export function cancelRestAlert() {
  enqueue(() => Notifications.cancelScheduledNotificationAsync(ID));
}
