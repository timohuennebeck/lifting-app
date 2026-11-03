import { fetch } from 'expo/fetch';

import { env } from '@/shared/config/env';

import { parseJson } from './json';

export interface PostFunctionOptions {
  /** Stops the call; without one it runs until it answers or fails. */
  signal?: AbortSignal;
  /** The user's access token, for a function that answers per user. */
  token?: string;
  /** The error for a function that can't be reached; once stopped, the fetch's own is thrown. */
  offline: () => Error;
}

/**
 * POSTs `body` to an Edge Function. expo/fetch, unlike React Native's own fetch, hands over a
 * streamed answer while it arrives.
 */
export function postFunction(
  name: string,
  body: unknown,
  { signal, token, offline }: PostFunctionOptions,
) {
  return fetch(`${env.supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      apikey: env.supabasePublishableKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  }).catch((error: unknown) => {
    if (signal?.aborted) throw error;
    console.warn(`${name} could not be called`, error);
    throw offline();
  });
}

/** A function's answer that isn't ok, logged with its status: the `{ error }` it sent, or {}. */
export async function refusalOf<B extends object = { error?: string }>(
  name: string,
  response: { status: number; text: () => Promise<string> },
): Promise<Partial<B>> {
  const text = await response.text().catch(() => '');
  console.warn(`${name} answered ${response.status}: ${text.slice(0, 300)}`);
  return parseJson<Partial<B> | null>(text, null) ?? {};
}
