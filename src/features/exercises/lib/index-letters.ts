const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Korean lists index by initial consonant, as the phone's contacts do. */
const HANGUL = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** The index letter of each of Hangul's 19 initial consonants, doubled ones under their single. */
const INITIALS = 'ㄱㄱㄴㄷㄷㄹㅁㅂㅂㅅㅅㅇㅈㅈㅊㅋㅌㅍㅎ'.split('');

/** Hangul syllables (가–힣) come in blocks of 588, one per initial consonant. */
const FIRST_SYLLABLE = 0xac00;
const LAST_SYLLABLE = 0xd7a3;
const SYLLABLES_PER_INITIAL = 588;

/** The index rail's entries, top to bottom: A–Z, or ㄱ–ㅎ and "#" for other names in Korean. */
export const indexLetters = (language: string) => (language === 'ko' ? [...HANGUL, '#'] : LATIN);

/**
 * A name's entry in the index: its initial consonant for Hangul, otherwise its upper-case first
 * letter without accents (NFD splits "Ü" into "U" + a combining mark), or "#" in Korean.
 */
export function indexLetterOf(name: string, language: string) {
  const code = name.charCodeAt(0);
  if (code >= FIRST_SYLLABLE && code <= LAST_SYLLABLE) {
    return INITIALS[Math.floor((code - FIRST_SYLLABLE) / SYLLABLES_PER_INITIAL)];
  }
  return language === 'ko' ? '#' : name.normalize('NFD').charAt(0).toUpperCase();
}
