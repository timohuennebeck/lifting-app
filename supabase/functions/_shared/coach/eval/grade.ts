// Checks for the coach eval: which numbers an answer contains and whether the tools gave them,
// its language and its length.

const tokensIn = (text: string) =>
  [...text.replaceAll('**', '').matchAll(/\d+(?:[.,]\d+)*/g)].map(([t]) => t);

/** A number as the language writes it: "1.234,5" in German, "1,234.5" in English. */
function parse(token: string, language: string) {
  const thousands = language === 'en' ? /,(?=\d{3}(?:\D|$))/g : /\.(?=\d{3}(?:\D|$))/g;
  return Number(token.replace(thousands, '').replace(',', '.'));
}

export const numbersIn = (text: string, language: string) =>
  tokensIn(text).map((token) => parse(token, language));

/**
 * Numbers of the answer the allowed ones don't explain. A number matches when it is one of them
 * rounded (79.6 → "80") or a thousandth of one (9,600 kg → "9,6 t"); a date like "12.10." when
 * each of its parts does.
 */
export function unmatchedNumbers(answer: string, language: string, allowed: number[]) {
  const candidates = allowed.flatMap((v) => {
    const n = Math.abs(v);
    return [
      n,
      Math.round(n),
      Math.round(n * 10) / 10,
      Math.round(n / 100) / 10,
      Math.round(n / 1000),
    ];
  });
  const known = (n: number) => candidates.some((c) => Math.abs(c - n) < 0.051);
  return tokensIn(answer)
    .filter(
      (token) =>
        !known(parse(token, language)) && !token.split(/[.,]/).every((p) => known(Number(p))),
    )
    .map((token) => parse(token, language));
}

/** ISO week number of a day (YYYY-MM-DD): the week with the year's first Thursday is week 1. */
function isoWeek(day: string) {
  const thursdayOf = (date: Date) => {
    const copy = new Date(date);
    copy.setUTCDate(copy.getUTCDate() - ((copy.getUTCDay() + 6) % 7) + 3);
    return copy;
  };
  const thursday = thursdayOf(new Date(`${day}T00:00:00Z`));
  const first = thursdayOf(new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4)));
  return 1 + Math.round((thursday.getTime() - first.getTime()) / (7 * 86_400_000));
}

/** Every number in tool results, questions and context, with the parts and ISO weeks of dates. */
export function numbersOf(sources: unknown[]) {
  const found: number[] = [];
  const visit = (value: unknown) => {
    if (typeof value === 'number') found.push(value);
    else if (typeof value === 'string') {
      for (const [day] of value.matchAll(/\d{4}-\d{2}-\d{2}/g)) found.push(isoWeek(day));
      for (const [n] of value.matchAll(/\d+(?:\.\d+)?/g)) found.push(Number(n));
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  sources.forEach(visit);
  return found;
}

const WORDS: Record<string, RegExp> = {
  de: /\b(du|dein|deine|deinem|deinen|und|der|die|das|nicht|mit|ist|hast|bei|seit|pro|woche)\b/gi,
  en: /\b(you|your|and|the|is|have|with|not|since|per|week|were)\b/gi,
};

/** Whichever of de and en has more of its common words in the text. */
export function languageOf(text: string) {
  const [de, en] = ['de', 'en'].map((l) => text.match(WORDS[l])?.length ?? 0);
  return de === en ? '?' : de > en ? 'de' : 'en';
}

export function sentenceCount(text: string) {
  return text
    .replace(/(\d)[.,](\d)/g, '$1$2')
    .split(/[.!?]+(?=\s|$)/)
    .filter((s) => s.trim()).length;
}
