// What the plan functions (read-plan, generate-plan) share: the exercise catalog, the limits
// per network and per day (they run before there is an account, and each is a paid model call),
// and the response that streams the plan to the app.
import { encodeHex } from 'jsr:@std/encoding@1/hex';

import { admin, reply } from './common.ts';
import type { PlanEvent } from './plan-events.ts';

/** An active row of `public.exercises`, as much as the models need. */
export interface CatalogRow {
  id: string;
  name: Record<string, string>;
  /** What the app shows with it; `needs` says what the user must have. */
  equipment: string;
  /** Equipment ids: every list needs one of its items (public.exercises.needs). */
  needs: string[][];
  measures: string[];
  /** Share of the training stimulus per muscle; values sum to 1. */
  muscles: Record<string, number>;
  rest_seconds: number;
  cardio: boolean;
}

/** A row of `public.equipment`, as much as the plan functions need. */
export interface EquipmentRow {
  id: string;
  /** A full gym has it. */
  in_gym: boolean;
}

const CATALOG_TTL_MS = 10 * 60_000;

/** The active rows of a catalog table, read at most every 10 minutes per function instance. */
function cachedTable<T>(table: string, columns: string) {
  let cache: { at: number; rows: T[] } | null = null;
  return async () => {
    if (cache && Date.now() - cache.at < CATALOG_TTL_MS) return cache.rows;
    const { data, error } = await admin
      .from(table)
      .select(columns)
      .eq('is_active', true)
      .order('id');
    if (error) throw error;
    cache = { at: Date.now(), rows: data as T[] };
    return cache.rows;
  };
}

export const loadCatalog = cachedTable<CatalogRow>(
  'exercises',
  'id, name, equipment, needs, measures, muscles, rest_seconds, cardio',
);

export const loadEquipment = cachedTable<EquipmentRow>('equipment', 'id, in_gym');

/** A whole number from the environment; the default when unset or not a number. */
export function envLimit(name: string, fallback: number) {
  const value = Number(Deno.env.get(name));
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

/**
 * The network the request came from: its IPv4 address, or the /64 an IPv6 address is in (one
 * connection gets a whole /64, so single addresses would be free to rotate).
 */
function networkOf(ip: string) {
  // IPv4, also with a port or written as IPv6 (::ffff:1.2.3.4).
  const v4 = ip.match(/(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);
  if (v4) return v4[1];
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const groups = [
    ...left,
    ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'),
    ...right,
  ];
  return `${groups
    .slice(0, 4)
    .map((g) => g.padStart(4, '0'))
    .join(':')}::/64`;
}

/** The network as a keyed hash: the IP itself is never stored. */
async function networkHash(req: Request) {
  // The first address is the client's as the platform's proxies forward it.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return encodeHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(networkOf(ip))));
}

/**
 * Takes one request of `kind` for the caller's network if it and everyone together are below
 * their limits in the last 24 hours (start_plan_request). Resolves with `giveBack`, which hands it
 * back (when the model call failed before it could be billed), or with the error response.
 */
export async function takePlanRequest(
  req: Request,
  kind: 'import' | 'generate',
  limits: { perNetwork: number; perDay: number },
): Promise<{ giveBack: () => PromiseLike<unknown> } | { refused: Response }> {
  const { data: slot, error } = await admin.rpc('start_plan_request', {
    p_kind: kind,
    p_ip_hash: await networkHash(req),
    p_ip_limit: limits.perNetwork,
    p_daily_limit: limits.perDay,
  });
  if (error) {
    console.error(`Starting the ${kind} failed`, error);
    return { refused: reply(500, { error: 'failed' }) };
  }
  if (!slot) return { refused: reply(429, { error: 'limit' }) };
  return { giveBack: () => admin.from('plan_requests').delete().eq('id', slot) };
}

/**
 * The plan as server-sent events: `run` sends them; when it throws, the app gets an `error`
 * event. Cancelling (the app went away) aborts `stop`, which should stop the model too.
 */
export function planEventResponse(
  run: (send: (event: PlanEvent) => void) => Promise<void>,
  stop: AbortController,
  label: string,
) {
  const encoder = new TextEncoder();
  const events = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: PlanEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      void run(send)
        .catch((error) => {
          if (stop.signal.aborted) return;
          console.error(`The ${label} broke off`, error);
          send({ type: 'error', error: 'failed' });
        })
        .finally(() => {
          try {
            controller.close();
          } catch {
            // Already closed because the app went away.
          }
        });
    },
    cancel: () => stop.abort(),
  });
  return new Response(events, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      // Proxies pass each event on right away instead of collecting the answer.
      'X-Accel-Buffering': 'no',
    },
  });
}
