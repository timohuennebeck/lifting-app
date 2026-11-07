// deno test supabase/functions/_shared/send-email.test.ts
// The send-email hook's emails: every app language has both, with the code or link in them.
import { assert, assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';

import { buildEmail, confirmationLink, isEmailType } from '../send-email/emails.ts';
import type { AppLanguage } from './plan-events.ts';

const LANGUAGES: AppLanguage[] = ['de', 'en', 'pt-PT', 'pt-BR', 'ko', 'es', 'fr'];
const input = {
  code: '482913',
  link: 'https://example.supabase.co/auth/v1/verify?token=a&type=signup',
};

Deno.test('the reset email carries the code in every language', () => {
  for (const language of LANGUAGES) {
    const email = buildEmail('recovery', language, input);
    assert(email.subject, language);
    assertStringIncludes(email.html, '482913');
    assertStringIncludes(email.html, `lang="${language}"`);
    assertStringIncludes(email.text, '482913');
  }
});

Deno.test('the sign-up email links to the confirmation in every language', () => {
  for (const language of LANGUAGES) {
    const email = buildEmail('signup', language, input);
    assertStringIncludes(
      email.html,
      'href="https://example.supabase.co/auth/v1/verify?token=a&amp;type=signup"',
    );
    assertStringIncludes(email.text, input.link);
  }
});

Deno.test('the emails differ by language', () => {
  const subjects = new Set(LANGUAGES.map((l) => buildEmail('recovery', l, input).subject));
  assertEquals(subjects.size, LANGUAGES.length);
});

Deno.test('the confirmation link goes through Auth and back to the redirect, else the site', () => {
  const data = {
    token_hash: 'abc',
    email_action_type: 'signup',
    redirect_to: '',
    site_url: 'https://useloqqa.com',
  };
  const link = new URL(confirmationLink('https://ref.supabase.co/', data));
  assertEquals(link.origin + link.pathname, 'https://ref.supabase.co/auth/v1/verify');
  assertEquals(link.searchParams.get('token'), 'abc');
  assertEquals(link.searchParams.get('type'), 'signup');
  assertEquals(link.searchParams.get('redirect_to'), 'https://useloqqa.com');
  const back = confirmationLink('https://ref.supabase.co', { ...data, redirect_to: 'loqqa://' });
  assertEquals(new URL(back).searchParams.get('redirect_to'), 'loqqa://');
});

Deno.test('only the reset and sign-up emails are written', () => {
  assert(isEmailType('recovery'));
  assert(isEmailType('signup'));
  for (const type of ['magiclink', 'invite', 'email_change', 'reauthentication', 'x']) {
    assert(!isEmailType(type), type);
  }
});
