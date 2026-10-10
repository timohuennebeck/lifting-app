import { diffArrays, diffWordsWithSpace } from 'diff';

import { type MarkdownBlock, parseMarkdown, plainText } from '@/shared/ui/markdown';

/** A run of text in the comparison: unchanged, new in this version, or no longer in it. */
export interface DiffSegment {
  text: string;
  change?: 'added' | 'removed';
}

export type DiffBlock =
  | { type: 'same'; block: MarkdownBlock }
  | { type: 'paragraph' | 'quote'; segments: DiffSegment[] }
  | { type: 'list'; ordered: boolean; items: DiffSegment[][] }
  | { type: 'rule'; change: 'added' | 'removed' };

export type SectionStatus = 'same' | 'added' | 'changed' | 'removed';

export interface DiffSection {
  /** Stable id for jumping to the section from the change list. */
  key: string;
  status: SectionStatus;
  /** "4.6" or "13", when the heading is numbered. */
  number: string | null;
  /** Heading without its number; empty for the text before the first heading. */
  title: string;
  level: number;
  heading: DiffSegment[] | null;
  blocks: DiffBlock[];
}

export interface LegalChange {
  kind: 'added' | 'changed' | 'removed';
  key: string;
  number: string | null;
  /** Section heading; empty for the introduction. */
  title: string;
}

interface Section {
  key: string;
  number: string | null;
  title: string;
  level: number;
  headingText: string | null;
  blocks: MarkdownBlock[];
}

/** "13. Laufzeit …", "4.6 Körpercheck" or "§ 7 Regeln …": its number and title. */
const HEADING_NUMBER = /^(?:§\s*)?(\d+(?:\.\d+)*)\.?\s+(.+)$/;

/** Text as compared: no formatting, no punctuation or spacing differences (those never count). */
const normalize = (text: string) =>
  plainText(text)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}§%€$]+/gu, ' ')
    .trim();

const blockText = (block: MarkdownBlock) =>
  block.type === 'list' ? block.items.join(' ') : block.type === 'rule' ? '---' : block.text;

/** Sections by heading (levels 2 and 3); the document's own title (level 1) isn't one. */
function splitSections(markdown: string): Section[] {
  const sections: Section[] = [
    { key: 'intro', number: null, title: '', level: 0, headingText: null, blocks: [] },
  ];
  for (const block of parseMarkdown(markdown)) {
    if (block.type === 'heading' && block.level > 1) {
      const text = plainText(block.text);
      const numbered = HEADING_NUMBER.exec(text);
      const number = numbered?.[1] ?? null;
      const title = numbered?.[2] ?? text;
      sections.push({
        key: `s${sections.length}-${number ?? normalize(title).slice(0, 24)}`,
        number,
        title,
        level: block.level,
        headingText: block.text,
        blocks: [],
      });
    } else if (block.type !== 'heading') {
      sections[sections.length - 1].blocks.push(block);
    }
  }
  // An introduction without text isn't a section.
  return sections.filter((s) => s.key !== 'intro' || s.blocks.length);
}

const sectionText = (s: Section) => normalize(s.blocks.map(blockText).join(' '));

/** Share of words two texts have in common (0–1), for telling a renamed section apart. */
function overlap(a: string, b: string) {
  const wa = new Set(a.split(' ').filter(Boolean));
  const wb = new Set(b.split(' ').filter(Boolean));
  if (!wa.size || !wb.size) return 0;
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / Math.max(wa.size, wb.size);
}

/**
 * Pairs the new version's sections with the old one's: by title first, so inserting a section
 * doesn't shift every number after it; then a renamed section by its mostly unchanged text.
 */
function matchSections(oldSections: Section[], newSections: Section[]) {
  const pairs = new Map<number, number>();
  const used = new Set<number>();
  newSections.forEach((n, i) => {
    const j = oldSections.findIndex(
      (o, k) => !used.has(k) && o.level === n.level && normalize(o.title) === normalize(n.title),
    );
    if (j >= 0) {
      pairs.set(i, j);
      used.add(j);
    }
  });
  newSections.forEach((n, i) => {
    if (pairs.has(i)) return;
    let best = -1;
    let bestScore = 0.5;
    oldSections.forEach((o, k) => {
      if (used.has(k) || o.level !== n.level) return;
      const score = overlap(sectionText(o), sectionText(n));
      if (score > bestScore) {
        best = k;
        bestScore = score;
      }
    });
    if (best >= 0) {
      pairs.set(i, best);
      used.add(best);
    }
  });
  return { pairs, used };
}

/**
 * Word by word, with neighbouring changes merged: "~~auf unbestimmte Zeit~~ 12 Monate" reads
 * better than every word struck through and replaced on its own.
 */
function wordSegments(oldText: string, newText: string): DiffSegment[] {
  const out: DiffSegment[] = [];
  let removed = '';
  let added = '';
  let space = '';
  const flush = () => {
    if (removed) out.push({ text: removed, change: 'removed' });
    if (added) out.push({ text: added, change: 'added' });
    if (space) out.push({ text: space });
    removed = added = space = '';
  };
  for (const part of diffWordsWithSpace(plainText(oldText), plainText(newText))) {
    const changing = !!(removed || added);
    if (part.added || part.removed) {
      // Spaces between two changes belong to both sides of the merged change.
      removed += part.removed ? space + part.value : space;
      added += part.added ? space + part.value : space;
      space = '';
    } else if (changing && /^\s+$/.test(part.value)) {
      space += part.value;
    } else {
      flush();
      out.push({ text: part.value });
    }
  }
  flush();
  return out;
}

const whole = (text: string, change: 'added' | 'removed'): DiffSegment[] => [
  { text: plainText(text), change },
];

function wholeBlock(block: MarkdownBlock, change: 'added' | 'removed'): DiffBlock {
  switch (block.type) {
    case 'list':
      return {
        type: 'list',
        ordered: block.ordered,
        items: block.items.map((i) => whole(i, change)),
      };
    case 'rule':
      return { type: 'rule', change };
    case 'heading':
    case 'paragraph':
      return { type: 'paragraph', segments: whole(block.text, change) };
    case 'quote':
      return { type: 'quote', segments: whole(block.text, change) };
  }
}

/** List items aligned, a replaced item compared word by word. */
function diffItems(oldItems: string[], newItems: string[]): DiffSegment[][] {
  const out: DiffSegment[][] = [];
  const parts = diffArrays(oldItems, newItems, {
    comparator: (a, b) => normalize(a) === normalize(b),
  });
  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    const next = parts[p + 1];
    if (part.removed && next?.added) {
      const n = Math.max(part.value.length, next.value.length);
      for (let i = 0; i < n; i++) {
        const o = part.value[i];
        const a = next.value[i];
        if (o != null && a != null) out.push(wordSegments(o, a));
        else if (a != null) out.push(whole(a, 'added'));
        else if (o != null) out.push(whole(o, 'removed'));
      }
      p++;
    } else {
      const change = part.added ? 'added' : part.removed ? 'removed' : undefined;
      for (const item of part.value) {
        out.push(change ? whole(item, change) : [{ text: plainText(item) }]);
      }
    }
  }
  return out;
}

/** Blocks of a changed section: unchanged ones as they are, replaced ones word by word. */
function diffBlocks(oldBlocks: MarkdownBlock[], newBlocks: MarkdownBlock[]): DiffBlock[] {
  const out: DiffBlock[] = [];
  const parts = diffArrays(oldBlocks, newBlocks, {
    comparator: (a, b) => a.type === b.type && normalize(blockText(a)) === normalize(blockText(b)),
  });
  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    const next = parts[p + 1];
    if (!part.added && !part.removed) {
      // Unchanged blocks keep their formatting; the new version's spelling is shown.
      out.push(...part.value.map((block): DiffBlock => ({ type: 'same', block })));
      continue;
    }
    if (part.removed && next?.added) {
      // A replacement: blocks of the same kind are compared word by word, in order.
      const removed = [...part.value];
      for (const block of next.value) {
        const at = removed.findIndex((r) => r.type === block.type);
        const old = at >= 0 ? removed.splice(at, 1)[0] : null;
        if (old?.type === 'list' && block.type === 'list') {
          out.push({
            type: 'list',
            ordered: block.ordered,
            items: diffItems(old.items, block.items),
          });
        } else if (
          old &&
          (old.type === 'paragraph' || old.type === 'quote') &&
          (block.type === 'paragraph' || block.type === 'quote')
        ) {
          out.push({ type: block.type, segments: wordSegments(old.text, block.text) });
        } else {
          out.push(wholeBlock(block, 'added'));
        }
      }
      out.push(...removed.map((block) => wholeBlock(block, 'removed')));
      p++;
      continue;
    }
    const change = part.added ? 'added' : 'removed';
    out.push(...part.value.map((block) => wholeBlock(block, change)));
  }
  return out;
}

/**
 * The new version section by section against the old one, removed sections where they were.
 * Formatting and punctuation-only edits don't count as changes.
 */
export function diffLegalDocuments(oldMarkdown: string, newMarkdown: string): DiffSection[] {
  const oldSections = splitSections(oldMarkdown);
  const newSections = splitSections(newMarkdown);
  const { pairs, used } = matchSections(oldSections, newSections);

  const result: DiffSection[] = [];
  const removedAfter = (oldIndex: number) =>
    oldSections
      .map((s, k) => ({ s, k }))
      .filter(({ k }) => !used.has(k) && k > oldIndex)
      .filter(({ k }) => {
        // Placed after the last kept section that came before it in the old version.
        const keptBefore = [...pairs.values()].filter((v) => v < k);
        return (keptBefore.length ? Math.max(...keptBefore) : -1) === oldIndex;
      });
  const pushRemoved = (oldIndex: number) => {
    for (const { s } of removedAfter(oldIndex)) {
      result.push({
        key: `removed-${s.key}`,
        status: 'removed',
        number: s.number,
        title: s.title,
        level: s.level,
        heading: s.headingText ? whole(s.headingText, 'removed') : null,
        blocks: s.blocks.map((b) => wholeBlock(b, 'removed')),
      });
    }
  };

  pushRemoved(-1);
  newSections.forEach((n, i) => {
    const j = pairs.get(i);
    const o = j != null ? oldSections[j] : null;
    if (!o) {
      result.push({
        key: n.key,
        status: 'added',
        number: n.number,
        title: n.title,
        level: n.level,
        heading: n.headingText ? whole(n.headingText, 'added') : null,
        blocks: n.blocks.map((b) => wholeBlock(b, 'added')),
      });
      return;
    }
    // By title: a number that moved because a section was added or removed isn't a change.
    const headingChanged = normalize(o.title) !== normalize(n.title);
    const textChanged = sectionText(o) !== sectionText(n);
    result.push({
      key: n.key,
      status: headingChanged || textChanged ? 'changed' : 'same',
      number: n.number,
      title: n.title,
      level: n.level,
      heading: n.headingText
        ? headingChanged
          ? wordSegments(o.headingText ?? '', n.headingText)
          : [{ text: plainText(n.headingText) }]
        : null,
      blocks: textChanged
        ? diffBlocks(o.blocks, n.blocks)
        : n.blocks.map((block): DiffBlock => ({ type: 'same', block })),
    });
    pushRemoved(j!);
  });
  return result;
}

/** The changed sections, in document order: what the update page lists. */
export const legalChanges = (sections: DiffSection[]): LegalChange[] =>
  sections
    .filter((s) => s.status !== 'same')
    .map((s) => ({
      kind: s.status as LegalChange['kind'],
      key: s.key,
      number: s.number,
      title: s.title,
    }));
