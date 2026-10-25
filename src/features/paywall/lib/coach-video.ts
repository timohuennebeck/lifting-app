import type { VideoSource } from 'expo-video';

export const COACH = {
  name: 'Kai Brooks',
  avatar: require('@/assets/images/coach-kai-avatar.jpg'),
} as const;

/**
 * The coach's thank-you video (bundled, English audio). Set it to null and the poster
 * stands in while a timer drives the progress ring and captions.
 */
export const COACH_VIDEO_SOURCE: VideoSource = require('@/assets/videos/coach-kai.mp4');
export const COACH_POSTER = require('@/assets/images/coach-kai.jpg');
/** Width / height of the video and poster (1080 × 1920). */
export const COACH_VIDEO_ASPECT = 9 / 16;
/**
 * Where a frame of another shape cuts the video and poster: the share of the overflow taken off
 * the top, the rest off the bottom, so Kai's head stays in view.
 */
export const COACH_FOCUS_Y = 0.2;

/** Length of the timer fallback; a real video reports its own duration. */
export const COACH_FALLBACK_SECONDS = 30;

/**
 * Caption cues (seconds from the start, where each spoken line begins) →
 * `welcome.captions.*` keys, translated into the app language.
 */
const COACH_CAPTIONS = [
  { at: 0, key: 'welcome' },
  { at: 2.4, key: 'ready' },
  { at: 4, key: 'built' },
  { at: 8.5, key: 'blocks' },
  { at: 11.4, key: 'harder' },
  { at: 13.9, key: 'deload' },
  { at: 16.5, key: 'recover' },
  { at: 19.6, key: 'noPlanning' },
  { at: 21.3, key: 'appDoesIt' },
  { at: 22.9, key: 'howTo' },
  { at: 26.3, key: 'rest' },
  { at: 28, key: 'start' },
] as const;

type CaptionKey = (typeof COACH_CAPTIONS)[number]['key'];

export function captionAt(seconds: number): CaptionKey {
  let key: CaptionKey = COACH_CAPTIONS[0].key;
  for (const cue of COACH_CAPTIONS) if (cue.at <= seconds) key = cue.key;
  return key;
}
