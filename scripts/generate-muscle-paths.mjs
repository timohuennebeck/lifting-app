// Converts the design's muscle SVGs into a typed path table for react-native-svg.
// Usage: node scripts/generate-muscle-paths.mjs, then run prettier on the written file.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'design/assets/muscles';
const OUT = 'src/shared/ui/muscle-map/body-paths.ts';

const strip = (svg) => svg.replace(/<metadata>[\s\S]*?<\/metadata>/, '');
const attr = (tag, name) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];

// Same rule as design/muscle-map.js: unlabelled "fx" shapes become knees, hands or feet by height.
function jointFor(front, d) {
  const y = Number(/M\s*[\d.]+[\s,]+([\d.]+)/.exec(d)?.[1]);
  if (front)
    return y > 990 && y < 1070 ? 'knees' : y > 690 && y < 830 ? 'hands' : y > 1190 ? 'feet' : null;
  return y > 700 && y < 830 ? 'hands' : y > 1300 ? 'feet' : null;
}

// Path commands boxOf understands (s and t would need the previous control point).
const ARG_COUNT = { m: 2, l: 2, h: 1, v: 1, c: 6, q: 4, a: 7, z: 0 };
const NUMBER = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/iy;

// How far an arc can get from its start: it stays on its ellipse, whose radii grow when they
// can't span the chord (SVG 1.1 F.6.6), so within the ellipse's widest diameter.
function arcReach(x1, y1, [rx, ry, degrees, , , x2, y2]) {
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (!rx || !ry) return 0; // drawn as a straight line
  const phi = (degrees * Math.PI) / 180;
  const [dx, dy] = [(x1 - x2) / 2, (y1 - y2) / 2];
  const x = Math.cos(phi) * dx + Math.sin(phi) * dy;
  const y = -Math.sin(phi) * dx + Math.cos(phi) * dy;
  const grow = Math.max(1, Math.hypot(x / rx, y / ry));
  return 2 * Math.max(rx, ry) * grow;
}

// Bounding box [minX, minY, maxX, maxY] of a path, never too small: curves stay within their
// control points, arcs within arcReach. Lets the map skip paths outside a crop.
function boxOf(d, pad) {
  const xs = [];
  const ys = [];
  const add = (x, y, reach = 0) => {
    xs.push(x - reach, x + reach);
    ys.push(y - reach, y + reach);
  };
  let i = 0;
  const skip = () => {
    while (/[\s,]/.test(d[i] ?? '')) i++;
  };
  const number = () => {
    skip();
    NUMBER.lastIndex = i;
    const [match] = NUMBER.exec(d);
    i = NUMBER.lastIndex;
    return Number(match);
  };
  const flag = () => {
    skip();
    return Number(d[i++]);
  };
  let [x, y, startX, startY] = [0, 0, 0, 0];
  let command = '';
  for (skip(); i < d.length; skip()) {
    if (/[a-z]/i.test(d[i])) command = d[i++];
    // Numbers after a moveto are linetos.
    else if (command === 'M') command = 'L';
    else if (command === 'm') command = 'l';
    const lower = command.toLowerCase();
    if (!(lower in ARG_COUNT)) throw new Error(`Unsupported path command "${command}" in ${d}`);
    const args = Array.from({ length: ARG_COUNT[lower] }, (_, k) =>
      lower === 'a' && (k === 3 || k === 4) ? flag() : number(),
    );
    const relative = command === lower;
    // The k-th argument and the one after it as an absolute point.
    const at = (k) => [args[k] + (relative ? x : 0), args[k + 1] + (relative ? y : 0)];
    if (lower === 'z') [x, y] = [startX, startY];
    else if (lower === 'h') x = args[0] + (relative ? x : 0);
    else if (lower === 'v') y = args[0] + (relative ? y : 0);
    else if (lower === 'a') {
      add(x, y, arcReach(x, y, [...args.slice(0, 5), ...at(5)]));
      [x, y] = at(5);
    } else {
      for (let k = 0; k < args.length - 2; k += 2) add(...at(k));
      [x, y] = at(args.length - 2);
      if (lower === 'm') [startX, startY] = [x, y];
    }
    add(x, y);
  }
  return [
    Math.floor(Math.min(...xs) - pad),
    Math.floor(Math.min(...ys) - pad),
    Math.ceil(Math.max(...xs) + pad),
    Math.ceil(Math.max(...ys) + pad),
  ];
}

function parseBody(file) {
  const svg = strip(readFileSync(join(SRC, file), 'utf8'));
  const front = svg.includes('data-view="front"');
  const viewBox = attr(svg.match(/<svg[^>]*>/)[0], 'viewBox');
  const paths = [...svg.matchAll(/<path[^>]*>/g)].map(([tag]) => {
    const kind = attr(tag, 'class').split(' ')[0];
    const d = attr(tag, 'd');
    // The silhouette's 2-unit outline reaches up to 4 units out at its corners (miter limit 4).
    const box = boxOf(d, kind === 'sil' ? 4 : 0);
    const joint = kind === 'fx' ? jointFor(front, d) : null;
    if (joint) return { kind: 'm', muscle: joint, d, box };
    return { kind, muscle: attr(tag, 'data-muscle') ?? null, d, box };
  });
  return { viewBox, paths };
}

const front = parseBody('body-front.svg');
const back = parseBody('body-back.svg');
const JOINTS = ['feet', 'hands', 'knees'];
const isMuscle = (m) => m && !JOINTS.includes(m);
const backMuscles = new Set(back.paths.map((p) => p.muscle).filter(isMuscle));
const frontMuscles = new Set(front.paths.map((p) => p.muscle).filter(isMuscle));

const cards = Object.fromEntries(
  readdirSync(join(SRC, 'cards'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => {
      const svg = strip(readFileSync(join(SRC, 'cards', f), 'utf8'));
      const head = svg.match(/<svg[^>]*>/)[0];
      const muscle = attr(head, 'data-muscle');
      const usesBack = svg.includes('data-muscle="glutes"') || svg.includes('data-muscle="lats"');
      const view =
        usesBack || (backMuscles.has(muscle) && !frontMuscles.has(muscle)) ? 'back' : 'front';
      return [muscle, { view, viewBox: attr(head, 'viewBox') }];
    }),
);

const muscles = [...new Set([...frontMuscles, ...backMuscles])].sort();
const out = `// Generated by scripts/generate-muscle-paths.mjs from design/assets/muscles. Do not edit.
// Body artwork adapted from react-native-body-highlighter (MIT), see design/assets/muscles.

export const MUSCLE_IDS = ${JSON.stringify(muscles)} as const;
export type MuscleId = (typeof MUSCLE_IDS)[number];
/** Joints are drawn and selectable (e.g. pain areas) but are not trained muscles. */
export type JointId = ${JOINTS.map((j) => `'${j}'`).join(' | ')};
export type BodyPartId = MuscleId | JointId;
export type BodyView = 'front' | 'back';
export type BodyPathKind = 'sil' | 'hd' | 'm' | 'fx';

export interface BodyPath {
  kind: BodyPathKind;
  muscle: BodyPartId | null;
  d: string;
  /** Bounding box [minX, minY, maxX, maxY], outline included, rounded outwards. */
  box: [number, number, number, number];
}

export interface BodyArtwork {
  viewBox: string;
  paths: BodyPath[];
}

export const BODY: Record<BodyView, BodyArtwork> = ${JSON.stringify({ front, back })};

export const MUSCLE_CARDS: Record<MuscleId, { view: BodyView; viewBox: string }> = ${JSON.stringify(cards)};
`;
writeFileSync(OUT, out);
console.log(`Wrote ${OUT} (${muscles.length} muscles, ${Object.keys(cards).length} cards)`);
