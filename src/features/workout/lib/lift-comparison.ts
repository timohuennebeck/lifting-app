/**
 * What the weight a workout moved compares with, lightest first: the finished story says the
 * user lifted the heaviest one the weight reaches. Weights in kg, typical and never more; each
 * with its clay render from `assets/images/lift-objects/` (all facing left, in one clay grey).
 */
export const LIFT_OBJECTS = [
  {
    id: 'washingMachine',
    kg: 70,
    image: require('@/assets/images/lift-objects/washing-machine.webp'),
  },
  { id: 'motorbike', kg: 200, image: require('@/assets/images/lift-objects/motorbike.webp') },
  { id: 'jetSki', kg: 350, image: require('@/assets/images/lift-objects/jet-ski.webp') },
  { id: 'smallCar', kg: 1000, image: require('@/assets/images/lift-objects/small-car.webp') },
  { id: 'hippo', kg: 1500, image: require('@/assets/images/lift-objects/hippo.webp') },
  { id: 'pickupTruck', kg: 2200, image: require('@/assets/images/lift-objects/pickup-truck.webp') },
  { id: 'camperVan', kg: 3500, image: require('@/assets/images/lift-objects/camper-van.webp') },
  {
    id: 'miniExcavator',
    kg: 5000,
    image: require('@/assets/images/lift-objects/mini-excavator.webp'),
  },
  { id: 'tractor', kg: 6000, image: require('@/assets/images/lift-objects/tractor.webp') },
  { id: 'tRex', kg: 8000, image: require('@/assets/images/lift-objects/t-rex.webp') },
  { id: 'privateJet', kg: 10000, image: require('@/assets/images/lift-objects/private-jet.webp') },
  { id: 'bus', kg: 12000, image: require('@/assets/images/lift-objects/city-bus.webp') },
  { id: 'fireTruck', kg: 16000, image: require('@/assets/images/lift-objects/fire-truck.webp') },
  { id: 'motorYacht', kg: 25000, image: require('@/assets/images/lift-objects/motor-yacht.webp') },
  // Fully loaded; the render shows its cargo.
  { id: 'container', kg: 30000, image: require('@/assets/images/lift-objects/container.webp') },
  {
    id: 'passengerJet',
    kg: 41000,
    image: require('@/assets/images/lift-objects/passenger-jet.webp'),
  },
  {
    id: 'spaceShuttle',
    kg: 78000,
    image: require('@/assets/images/lift-objects/space-shuttle.webp'),
  },
  // The statue alone (copper skin and steel frame), without its pedestal.
  {
    id: 'statueOfLiberty',
    kg: 200000,
    image: require('@/assets/images/lift-objects/statue-of-liberty.webp'),
  },
] as const;

export type LiftObject = (typeof LIFT_OBJECTS)[number];

/** The heaviest object `kg` reaches, or null below the lightest. */
export function liftObjectFor(kg: number): LiftObject | null {
  let found: LiftObject | null = null;
  for (const object of LIFT_OBJECTS) if (object.kg <= kg) found = object;
  return found;
}
