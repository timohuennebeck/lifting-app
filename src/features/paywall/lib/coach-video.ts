import type { VideoSource } from 'expo-video';

export const COACH = { name: 'Max Krüger', initials: 'MK' } as const;

/**
 * The coach's thank-you video. No file exists yet: set this to a bundled
 * `require('@/assets/videos/…mp4')` or a remote URL. While it is null the poster
 * stands in and a timer drives the progress ring and captions.
 */
export const COACH_VIDEO_SOURCE: VideoSource = null;
export const COACH_POSTER = require('@/assets/images/demo-person.jpg');

/** Length of the timer fallback; a real video reports its own duration. */
export const COACH_FALLBACK_SECONDS = 24;

/** Caption cues (seconds from the start) → `welcome.captions.*` keys. */
const COACH_CAPTIONS = [
  { at: 0, key: 'hello' },
  { at: 6, key: 'thanks' },
  { at: 13, key: 'plan' },
  { at: 19, key: 'seeYou' },
] as const;

type CaptionKey = (typeof COACH_CAPTIONS)[number]['key'];

export function captionAt(seconds: number): CaptionKey {
  let key: CaptionKey = COACH_CAPTIONS[0].key;
  for (const cue of COACH_CAPTIONS) if (cue.at <= seconds) key = cue.key;
  return key;
}
