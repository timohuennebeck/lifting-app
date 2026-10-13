// Picks the parts of the model's answer out of the JSON while it is still being written, so each
// exercise can go to the app as soon as it is complete. Plain TypeScript, like plan.ts.

import type { ModelDay, ModelExercise } from './plan.ts';

/** A finished part of the answer, in the order the model writes them. */
export type PlanPiece =
  /** Everything before "days": whether it is a plan, and its name. */
  | { kind: 'start'; isPlan: boolean; name: string }
  /** A day's heading, name and weekday: everything before its "exercises". */
  | { kind: 'day'; day: Omit<ModelDay, 'exercises'> }
  | { kind: 'exercise'; exercise: ModelExercise };

interface Frame {
  type: 'object' | 'array';
  /** Where the object or array starts in the text. */
  start: number;
  /** `days` → day → `exercises` → exercise; deeper levels are only skipped through. */
  depth: 'root' | 'days' | 'day' | 'exercises' | 'exercise' | 'other';
  /** Objects: the key whose value comes next, and whether a key is expected. */
  key?: string;
  expectKey?: boolean;
}

/** An object's text up to one of its keys, closed so it parses on its own. */
const closePrefix = (text: string) => JSON.parse(`${text.replace(/,\s*$/, '')}}`);

/**
 * Reads the answer as it grows: `push` takes the next piece of text and returns the parts it
 * completed. It relies on the strict schema writing keys in its order (is_plan, name, days; per
 * day heading, name, weekday, exercises), which OpenAI's structured output does.
 */
export class PlanStream {
  private text = '';
  private at = 0;
  private stack: Frame[] = [];
  private inString = false;
  private escaped = false;
  /** Where the string being read started, when it is an object key. */
  private keyStart = -1;

  push(chunk: string): PlanPiece[] {
    this.text += chunk;
    const pieces: PlanPiece[] = [];
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
          const exercise = JSON.parse(this.text.slice(frame.start, this.at + 1)) as ModelExercise;
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
    if (parent.depth === 'root' && parent.key === 'days') return 'days';
    if (parent.depth === 'days') return 'day';
    if (parent.depth === 'day' && parent.key === 'exercises') return 'exercises';
    if (parent.depth === 'exercises') return 'exercise';
    return 'other';
  }

  /** The keys after which everything before them is known. */
  private keyReached(frame: Frame): PlanPiece | null {
    const before = () => this.text.slice(frame.start, this.keyStart);
    if (frame.depth === 'root' && frame.key === 'days') {
      const { is_plan, name } = closePrefix(before());
      return { kind: 'start', isPlan: is_plan !== false, name: typeof name === 'string' ? name : '' };
    }
    if (frame.depth === 'day' && frame.key === 'exercises') {
      return { kind: 'day', day: closePrefix(before()) };
    }
    return null;
  }
}
