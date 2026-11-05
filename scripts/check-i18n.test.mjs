import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compareLocale } from './check-i18n.mjs';

test('flags a key the translation lacks', () =>
  assert.equal(compareLocale({ a: 'x', b: 'y' }, { a: 'x' }, 'es').length, 1));

test('flags a key only the translation has', () =>
  assert.equal(compareLocale({ a: 'x' }, { a: 'x', b: 'y' }, 'es').length, 1));

test('treats plural forms as one key', () =>
  assert.deepEqual(
    compareLocale({ n_one: '1', n_other: '{{count}}' }, { n_other: '{{count}}' }, 'ko'),
    [],
  ));

test('compares nested keys by their path', () => {
  assert.equal(compareLocale({ a: { b: 'x' } }, { a: {} }, 'es').length, 1);
  assert.deepEqual(compareLocale({ a: { b: 'x' } }, { a: { b: 'y' } }, 'es'), []);
});

test('compares list entries by position', () => {
  assert.deepEqual(compareLocale({ l: ['a {{n}}', 'b'] }, { l: ['x {{n}}', 'y'] }, 'es'), []);
  assert.equal(compareLocale({ l: ['a', 'b'] }, { l: ['x'] }, 'es').length, 1);
});

test('flags a lost placeholder', () =>
  assert.equal(compareLocale({ a: 'Hi {{name}}' }, { a: 'Hola' }, 'es').length, 1));

test('flags a lost tag', () =>
  assert.equal(compareLocale({ a: '<terms>T</terms>' }, { a: 'T' }, 'fr').length, 1));

test('requires {{count}} in _one where 0 takes that form', () => {
  const en = { n_one: '1 set', n_other: '{{count}} sets' };
  assert.equal(
    compareLocale(en, { n_one: '1 série', n_other: '{{count}} séries' }, 'fr').length,
    1,
  );
  assert.deepEqual(
    compareLocale(en, { n_one: '{{count}} série', n_other: '{{count}} séries' }, 'fr'),
    [],
  );
  assert.deepEqual(compareLocale(en, { n_one: '1 Satz', n_other: '{{count}} Sätze' }, 'de'), []);
});
