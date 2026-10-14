// Picks the parts of a model's training plan out of its JSON while it is still being written, so
// each exercise can go to the app as soon as it is complete. Plain TypeScript without Deno APIs.

/** A finished part of the answer, in the order the model writes them. */
export type PlanPiece<Routine, Exercise> =
  /** Everything before "routines": whether it is a plan (when the answer says), and its name. */
  | { kind: 'start'; isPlan: boolean; name: string }
  /** A routine's fields before its "exercises" (e.g. heading, name). */
  | { kind: 'routine'; routine: Omit<Routine, 'exercises'> }
  | { kind: 'exercise'; exercise: Exercise };

interface Frame {
  type: 'object' | 'array';
  /** Where the object or array starts in the text. */
  start: number;
  /** `routines` → routine → `exercises` → exercise; deeper levels are only skipped through. */
  depth: 'root' | 'routines' | 'routine' | 'exercises' | 'exercise' | 'other';
  /** Objects: the key whose value comes next, and whether a key is expected. */
  key?: string;
  expectKey?: boolean;
}

/** An object's text up to one of its keys, closed so it parses on its own. */
const closePrefix = (text: string) => JSON.parse(`${text.replace(/,\s*$/, '')}}`);

/**
 * Reads the answer as it grows: `push` takes the next piece of text and returns the parts it
 * completed. It relies on the strict schema writing keys in its order, which OpenAI's structured
 * output does: the plan's own fields before "routines", and each routine's before its
 * "exercises".
 */
export class PlanStream<Routine extends { exercises: unknown[] }, Exercise> {
  private text = '';
  private at = 0;
  private stack: Frame[] = [];
  private inString = false;
  private escaped = false;
  /** Where the string being read started, when it is an object key. */
  private keyStart = -1;

  push(chunk: string): PlanPiece<Routine, Exercise>[] {
    this.text += chunk;
    const pieces: PlanPiece<Routine, Exercise>[] = [];
    for (; this.at < this.text.length; this.at++) {
      const char = this.text[this.at];
      const top = this.stack.at(-1);
      if (this.inString) {
        if (this.escaped) this.escaped = false;
        else if (char === '\\') this.escaped = true;
        else if (char === '"') {
          this.inString = false;
          if (this.keyStart >= 0 && top) {
            top.key = JSON.parse(this.text.slice(this.keyStart, this.at + 1));
            top.expectKey = false;
            const piece = this.keyReached(top);
            if (piece) pieces.push(piece);
          }
          this.keyStart = -1;
        }
        continue;
      }
      if (char === '"') {
        this.inString = true;
        if (top?.type === 'object' && top.expectKey) this.keyStart = this.at;
      } else if (char === '{' || char === '[') {
        this.stack.push({
          type: char === '{' ? 'object' : 'array',
          start: this.at,
          depth: this.childDepth(top),
          ...(char === '{' ? { expectKey: true } : {}),
        });
      } else if (char === '}' || char === ']') {
        const frame = this.stack.pop();
        if (frame?.depth === 'exercise') {
          const exercise = JSON.parse(this.text.slice(frame.start, this.at + 1)) as Exercise;
          pieces.push({ kind: 'exercise', exercise });
        }
      } else if (char === ',' && top?.type === 'object') {
        top.expectKey = true;
      }
    }
    return pieces;
  }

  /** What an object or array opened inside `parent` holds. */
  private childDepth(parent: Frame | undefined): Frame['depth'] {
    if (!parent) return 'root';
    if (parent.depth === 'root' && parent.key === 'routines') return 'routines';
    if (parent.depth === 'routines') return 'routine';
    if (parent.depth === 'routine' && parent.key === 'exercises') return 'exercises';
    if (parent.depth === 'exercises') return 'exercise';
    return 'other';
  }

  /** The keys after which everything before them is known. */
  private keyReached(frame: Frame): PlanPiece<Routine, Exercise> | null {
    const before = () => this.text.slice(frame.start, this.keyStart);
    if (frame.depth === 'root' && frame.key === 'routines') {
      const { is_plan, name } = closePrefix(before());
      return {
        kind: 'start',
        isPlan: is_plan !== false,
        name: typeof name === 'string' ? name : '',
      };
    }
    if (frame.depth === 'routine' && frame.key === 'exercises') {
      return { kind: 'routine', routine: closePrefix(before()) };
    }
    return null;
  }
}
