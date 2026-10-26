import { MAX_SPOKEN } from './spoken-exercises';

/** The text of a voice input while speech recognition adds to it. */
export interface Transcript {
  /** The text from before this recognition: said earlier or typed. */
  before: string;
  /** What this recognition has settled on. */
  final: string;
  /** What is being said, still changing. */
  partial: string;
}

export const EMPTY_TRANSCRIPT: Transcript = { before: '', final: '', partial: '' };

const joinWords = (...parts: string[]) =>
  parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');

/** The whole text, as much as read-exercises takes; typed text stays as typed. */
export function transcriptText(t: Transcript) {
  const heard = !!t.final || !!t.partial;
  return (heard ? joinWords(t.before, t.final, t.partial) : t.before).slice(0, MAX_SPOKEN);
}

/** Starts a recognition that adds to the text so far. */
export const continueTranscript = (t: Transcript): Transcript => ({
  before: transcriptText(t),
  final: '',
  partial: '',
});

/**
 * Takes a recognition result. iOS before 18 repeats everything said so far and settles once at
 * the end; Android and iOS 18 settle each part after a pause and go on with the next one alone.
 * What repeats the settled text is dropped either way.
 */
export function addResult(t: Transcript, said: string, isFinal: boolean): Transcript {
  const text = said.trim();
  const repeats = t.final.length > 0 && text.startsWith(t.final);
  const fresh = repeats ? text.slice(t.final.length).trim() : text;
  if (!isFinal) return { ...t, partial: fresh };
  // A closing result without text keeps what was heard last.
  if (!fresh) return { ...t, final: joinWords(t.final, t.partial), partial: '' };
  // The closing result can repeat the part settled just before it.
  if (!t.partial && t.final.endsWith(fresh)) return t;
  return { ...t, final: joinWords(t.final, fresh), partial: '' };
}
