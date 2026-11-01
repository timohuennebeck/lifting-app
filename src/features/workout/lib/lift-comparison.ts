/**
 * What the weight a workout moved compares with, lightest first: the finished story says the
 * user lifted the heaviest one the weight reaches. Weights in kg, typical and never more. `image`
 * is the object's clay render (`assets/images/lift-objects/`); until it is added, `emoji` stands
 * in for it.
 */
export const LIFT_OBJECTS = [
  { id: 'washingMachine', kg: 70, image: null, emoji: '🧺' },
  { id: 'motorbike', kg: 200, image: null, emoji: '🏍️' },
  {
    id: 'jetSki',
    kg: 350,
    image: require('@/assets/images/lift-objects/jet-ski.webp'),
    emoji: '🚤',
  },
  { id: 'smallCar', kg: 1000, image: null, emoji: '🚗' },
  { id: 'hippo', kg: 1500, image: null, emoji: '🦛' },
  { id: 'pickupTruck', kg: 2200, image: null, emoji: '🛻' },
  { id: 'camperVan', kg: 3500, image: null, emoji: '🚐' },
  {
    id: 'miniExcavator',
    kg: 5000,
    image: require('@/assets/images/lift-objects/mini-excavator.webp'),
    emoji: '🏗️',
  },
  {
    id: 'tractor',
    kg: 6000,
    image: require('@/assets/images/lift-objects/tractor.webp'),
    emoji: '🚜',
  },
  { id: 'tRex', kg: 8000, image: null, emoji: '🦖' },
  {
    id: 'privateJet',
    kg: 10000,
    image: require('@/assets/images/lift-objects/private-jet.webp'),
    emoji: '🛩️',
  },
  { id: 'bus', kg: 12000, image: null, emoji: '🚌' },
  { id: 'fireTruck', kg: 16000, image: null, emoji: '🚒' },
  { id: 'motorYacht', kg: 25000, image: null, emoji: '🛥️' },
  // Fully loaded; the render shows its cargo.
  {
    id: 'container',
    kg: 30000,
    image: require('@/assets/images/lift-objects/container.webp'),
    emoji: '📦',
  },
  { id: 'passengerJet', kg: 41000, image: null, emoji: '✈️' },
  {
    id: 'spaceShuttle',
    kg: 78000,
    image: require('@/assets/images/lift-objects/space-shuttle.webp'),
    emoji: '🚀',
  },
] as const;

export type LiftObject = (typeof LIFT_OBJECTS)[number];

/** The heaviest object `kg` reaches, or null below the lightest. */
export function liftObjectFor(kg: number): LiftObject | null {
  let found: LiftObject | null = null;
  for (const object of LIFT_OBJECTS) if (object.kg <= kg) found = object;
  return found;
}
