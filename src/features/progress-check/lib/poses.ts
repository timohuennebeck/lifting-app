/** The three progress-check poses in capture order. */
export const POSES = ['front', 'side', 'back'] as const;
export type Pose = (typeof POSES)[number];

/** Muscle groups a check scores, in the design's order (BC_GROUPS). */
export const GROUPS = ['shoulders', 'chest', 'arms', 'back', 'core', 'legs'] as const;
export type CheckGroup = (typeof GROUPS)[number];

/** Self-timer steps the camera's timer button cycles through; 0 = off. */
export const TIMER_STEPS = [3, 10, 0] as const;
export type TimerSeconds = (typeof TIMER_STEPS)[number];

/** Warning orange of the camera and result screens (not part of the theme tokens). */
export const WARN_COLOR = '#FF8A3D';

/** First pose without a photo, preferring poses after `from`. */
export function nextMissingPose(taken: Partial<Record<Pose, unknown>>, from: Pose) {
  const start = POSES.indexOf(from) + 1;
  const order = [...POSES.slice(start), ...POSES.slice(0, start)];
  return order.find((pose) => !taken[pose]) ?? null;
}
