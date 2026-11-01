/**
 * What the weight a workout moved compares with, lightest first: the finished story says the
 * user lifted the heaviest one the weight reaches. Weights in kg, rounded. `emoji` stands in for
 * the object's picture until its render is added.
 */
export const LIFT_OBJECTS = [
  { id: 'washingMachine', kg: 70, emoji: '🧺' },
  { id: 'motorbike', kg: 200, emoji: '🏍️' },
  { id: 'grandPiano', kg: 500, emoji: '🎹' },
  { id: 'smallCar', kg: 1000, emoji: '🚗' },
  { id: 'rhino', kg: 2300, emoji: '🦏' },
  { id: 'elephant', kg: 6000, emoji: '🐘' },
  { id: 'tRex', kg: 8000, emoji: '🦖' },
  { id: 'bus', kg: 12000, emoji: '🚌' },
  { id: 'fireTruck', kg: 16000, emoji: '🚒' },
  { id: 'humpbackWhale', kg: 30000, emoji: '🐋' },
] as const;

export type LiftObject = (typeof LIFT_OBJECTS)[number];

/** The heaviest object `kg` reaches, or null below the lightest. */
export function liftObjectFor(kg: number): LiftObject | null {
  let found: LiftObject | null = null;
  for (const object of LIFT_OBJECTS) if (object.kg <= kg) found = object;
  return found;
}
