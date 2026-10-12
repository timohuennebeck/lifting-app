// Reads a training plan from photos or a file for the onboarding import. The app sends the photos
// (shrunk JPEGs) or the file as base64; the model gets them with the exercise catalog and answers
// in a fixed shape, which becomes the plan the user reviews. It runs before there is an account,
// so imports are limited per network and in total per day (start_plan_import).
import { decodeBase64 } from 'jsr:@std/encoding@1/base64';
import { encodeHex } from 'jsr:@std/encoding@1/hex';

import { admin, reply } from '../_shared/common.ts';
import { askStructured, openAiConfigured } from '../_shared/openai.ts';
import {
  buildSchema,
  type CatalogExercise,
  contextText,
  INSTRUCTIONS,
  type ModelOutput,
  toImportedPlan,
} from './plan.ts';

const OPENAI_TIMEOUT_MS = 120_000;
/** A whole number from the environment; the default when unset or not a number. */
function envLimit(name: string, fallback: number) {
  const value = Number(Deno.env.get(name));
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

/** Imports per network (hashed IP) and in total in 24 hours; each one is a paid model call. */
const IP_LIMIT = envLimit('PLAN_IMPORT_IP_LIMIT', 10);
const DAILY_LIMIT = envLimit('PLAN_IMPORT_DAILY_LIMIT', 1000);
const MAX_PHOTOS = 10;
/** Decoded sizes; the app shrinks photos to well below this. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
/** Characters of a text or spreadsheet file the model reads. */
const MAX_TEXT = 60_000;
const CATALOG_TTL_MS = 10 * 60_000;
const LANGUAGES = ['de', 'en', 'pt-PT', 'pt-BR'];

interface PlanFile {
  name: string;
  mimeType: string;
  /** Base64. */
  data: string;
}

let catalogCache: { at: number; rows: CatalogExercise[] } | null = null;

/** The active catalog, read at most every 10 minutes per function instance. */
async function loadCatalog() {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.rows;
  const { data, error } = await admin
    .from('exercises')
    .select('id, name, equipment, measures')
    .eq('is_active', true)
    .order('id');
  if (error) throw error;
  catalogCache = { at: Date.now(), rows: data as CatalogExercise[] };
  return catalogCache.rows;
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

const isBase64 = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && /^[A-Za-z0-9+/=\s]+$/.test(value);

/** Approximate decoded size of base64 text. */
const byteSize = (base64: string) => Math.floor((base64.replace(/\s/g, '').length * 3) / 4);

/** A spreadsheet as CSV text, one block per sheet. */
async function spreadsheetText(bytes: Uint8Array) {
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
  const book = XLSX.read(bytes, { type: 'array' });
  return book.SheetNames.map(
    (name: string) => `Sheet "${name}":\n${XLSX.utils.sheet_to_csv(book.Sheets[name])}`,
  ).join('\n\n');
}

/** Text in UTF-8, else Windows-1252 (what Excel on Windows saves CSV files as by default). */
function decodeText(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

/** The file as content the model reads: PDFs and images as they are, text and sheets as text. */
async function fileContent(file: PlanFile) {
  const type = file.mimeType.toLowerCase();
  const name = file.name.toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return {
      type: 'input_file',
      filename: file.name,
      file_data: `data:application/pdf;base64,${file.data}`,
    };
  }
  if (type.startsWith('image/')) {
    return { type: 'input_image', image_url: `data:${type};base64,${file.data}`, detail: 'high' };
  }
  const bytes = decodeBase64(file.data);
  const text =
    /\.(xlsx|xls)$/.test(name) || type.includes('spreadsheet') || type.includes('excel')
      ? await spreadsheetText(bytes)
      : decodeText(bytes);
  return { type: 'input_text', text: `File "${file.name}":\n${text.slice(0, MAX_TEXT)}` };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!openAiConfigured()) {
    console.error('OPENAI_API_KEY is not set (supabase/functions/.env)');
    return reply(500, { error: 'not_configured' });
  }

  const body = await req.json().catch(() => null);
  const language = LANGUAGES.includes(body?.language) ? body.language : 'de';
  const photos: unknown = body?.photos;
  const file: PlanFile | undefined = body?.file;
  const hasPhotos = Array.isArray(photos) && photos.length > 0;
  if (hasPhotos === !!file) return reply(400, { error: 'bad_request' });
  if (hasPhotos) {
    if (photos.length > MAX_PHOTOS || !photos.every(isBase64)) {
      return reply(400, { error: 'bad_request' });
    }
    if (photos.some((p) => byteSize(p) > MAX_PHOTO_BYTES))
      return reply(413, { error: 'too_large' });
  } else if (
    typeof file?.name !== 'string' ||
    typeof file.mimeType !== 'string' ||
    !isBase64(file.data)
  ) {
    return reply(400, { error: 'bad_request' });
  } else if (byteSize(file.data) > MAX_FILE_BYTES) {
    return reply(413, { error: 'too_large' });
  }

  const { data: slot, error: slotError } = await admin.rpc('start_plan_import', {
    p_ip_hash: await networkHash(req),
    p_ip_limit: IP_LIMIT,
    p_daily_limit: DAILY_LIMIT,
  });
  if (slotError) {
    console.error('Starting the import failed', slotError);
    return reply(500, { error: 'analysis_failed' });
  }
  if (!slot) return reply(429, { error: 'limit' });
  const giveBack = () => admin.from('plan_import_requests').delete().eq('id', slot);

  let catalog: CatalogExercise[];
  let content: unknown[];
  try {
    catalog = await loadCatalog();
    const source = hasPhotos
      ? (photos as string[]).map((p) => ({
          type: 'input_image',
          image_url: `data:image/jpeg;base64,${p}`,
          detail: 'high',
        }))
      : [await fileContent(file!)];
    content = [{ type: 'input_text', text: contextText(catalog, language) }, ...source];
  } catch (error) {
    console.error('Preparing the import failed', error);
    await giveBack();
    return reply(400, { error: 'unreadable' });
  }

  let answer: Awaited<ReturnType<typeof askStructured>>;
  try {
    answer = await askStructured({
      instructions: INSTRUCTIONS,
      content,
      name: 'training_plan',
      schema: buildSchema(catalog.map((e) => e.id)),
      timeoutMs: OPENAI_TIMEOUT_MS,
    });
  } catch (error) {
    // A timeout may still have been billed, so the import stays counted.
    console.error('OpenAI request failed', error);
    return reply(502, { error: 'analysis_failed' });
  }
  if ('upstream' in answer) {
    await giveBack();
    return reply(502, { error: 'analysis_failed', upstream: answer.upstream });
  }
  if ('refusal' in answer) {
    console.warn('The model refused the plan', answer.refusal);
    return reply(422, { error: 'not_a_plan' });
  }
  if ('incomplete' in answer) {
    console.error('The import did not complete', answer.incomplete);
    return reply(502, { error: 'analysis_failed' });
  }

  let plan: ReturnType<typeof toImportedPlan>;
  try {
    plan = toImportedPlan(JSON.parse(answer.text) as ModelOutput, catalog, () =>
      crypto.randomUUID(),
    );
  } catch (error) {
    console.error('The import answer could not be read', error);
    return reply(502, { error: 'analysis_failed' });
  }
  if (!plan) return reply(422, { error: 'not_a_plan' });
  return reply(200, { plan });
});
