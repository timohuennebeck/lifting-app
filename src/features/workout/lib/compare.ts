// Fun volume comparison from the design (Component.CMP.Tiere), weights in kg.
const ANIMALS = [
  { id: 'polarBear', kg: 450 },
  { id: 'giraffe', kg: 1200 },
  { id: 'hippo', kg: 1500 },
  { id: 'rhino', kg: 2300 },
  { id: 'elephant', kg: 6000 },
  { id: 'spermWhale', kg: 41000 },
  { id: 'blueWhale', kg: 150000 },
] as const;

/** Heaviest animal the volume beats, and how many of it were lifted. */
export function compareVolume(volumeKg: number) {
  const animal = [...ANIMALS].reverse().find((a) => volumeKg >= a.kg) ?? ANIMALS[0];
  return { animal, ratio: volumeKg / animal.kg };
}
