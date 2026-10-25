// Reads a training plan from photos, a file or what the user said, for the plan import (in
// onboarding and in the app). The app sends the photos (shrunk JPEGs), the file as base64 or the
// text speech recognition made of the user's words; the model gets them with the exercise catalog
// and answers in a fixed shape, which becomes the plan the user reviews. The
// answer is streamed: each exercise goes to the app as soon as the model has written it (see
// `PlanEvent`). It also runs before there is an account, so imports are limited per network and in
// total per day (start_plan_request).
import { decodeBase64 } from 'jsr:@std/encoding@1/base64';

import { reply } from '../_shared/common.ts';
import { openAiConfigured } from '../_shared/openai.ts';
import { LANGUAGES } from '../_shared/plan-events.ts';
import {
  type CatalogRow,
  envLimit,
  loadCatalog,
  planEventResponse,
  takePlanRequest,
} from '../_shared/plans.ts';
import { buildSchema, contextText, INSTRUCTIONS, planReader, SPOKEN_INSTRUCTIONS } from './plan.ts';

/** For both attempts together (see planEventResponse); the function may run 150 s at most. */
const OPENAI_TIMEOUT_MS = 120_000;
/** Imports per network (hashed IP) and in total in 24 hours; each one is a paid model call. */
const IP_LIMIT = envLimit('PLAN_IMPORT_IP_LIMIT', 10);
const DAILY_LIMIT = envLimit('PLAN_IMPORT_DAILY_LIMIT', 1000);
/** OpenAI's Fast mode for the import (twice the token price); PLAN_IMPORT_FAST=false turns it off. */
const FAST = Deno.env.get('PLAN_IMPORT_FAST') !== 'false';
const MAX_PHOTOS = 10;
/** Decoded sizes; the app shrinks photos to well below this. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
/** Characters of a text or spreadsheet file the model reads. */
const MAX_TEXT = 60_000;
/** Characters of a spoken plan (the app's MAX_SPOKEN). */
const MAX_SPOKEN = 4000;

interface PlanFile {
  name: string;
  mimeType: string;
  /** Base64. */
  data: string;
  /** Of a workbook, the sheets the user picked; all when left out. */
  sheets?: string[];
}

/** Sheet names a request may pick. */
const MAX_SHEETS = 100;

const isBase64 = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && /^[A-Za-z0-9+/=\s]+$/.test(value);

/** Left out, or a list of sheet names. */
const isSheetList = (value: unknown) =>
  value === undefined ||
  (Array.isArray(value) &&
    value.length <= MAX_SHEETS &&
    value.every((name) => typeof name === 'string'));

/** Approximate decoded size of base64 text. */
const byteSize = (base64: string) => Math.floor((base64.replace(/\s/g, '').length * 3) / 4);

/** A spreadsheet as CSV text, one block per picked sheet (all, if none of those is there). */
async function spreadsheetText(bytes: Uint8Array, sheets: string[] | undefined) {
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
  const book = XLSX.read(bytes, { type: 'array' });
  const names: string[] = book.SheetNames;
  const picked = names.filter((name) => sheets?.includes(name));
  return (picked.length ? picked : names)
    .map((name) => `Sheet "${name}":\n${XLSX.utils.sheet_to_csv(book.Sheets[name])}`)
    .join('\n\n');
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
    /\.(xlsx|xlsm|xls|ods)$/.test(name) || type.includes('spreadsheet') || type.includes('excel')
      ? await spreadsheetText(bytes, file.sheets)
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
  // What the user said, as speech recognition wrote it down.
  const spoken = typeof body?.text === 'string' ? body.text.trim() : '';
  const hasPhotos = Array.isArray(photos) && photos.length > 0;
  if (body?.text !== undefined && !spoken) return reply(400, { error: 'bad_request' });
  if ([hasPhotos, !!file, !!spoken].filter(Boolean).length !== 1) {
    return reply(400, { error: 'bad_request' });
  }
  if (spoken) {
    if (spoken.length > MAX_SPOKEN) return reply(413, { error: 'too_large' });
  } else if (hasPhotos) {
    if (photos.length > MAX_PHOTOS || !photos.every(isBase64)) {
      return reply(400, { error: 'bad_request' });
    }
    if (photos.some((p) => byteSize(p) > MAX_PHOTO_BYTES))
      return reply(413, { error: 'too_large' });
  } else if (
    typeof file?.name !== 'string' ||
    typeof file.mimeType !== 'string' ||
    !isBase64(file.data) ||
    !isSheetList(file.sheets)
  ) {
    return reply(400, { error: 'bad_request' });
  } else if (byteSize(file.data) > MAX_FILE_BYTES) {
    return reply(413, { error: 'too_large' });
  }

  const taken = await takePlanRequest(req, 'import', { perNetwork: IP_LIMIT, perDay: DAILY_LIMIT });
  if ('refused' in taken) return taken.refused;
  const { giveBack } = taken;

  let catalog: CatalogRow[];
  let content: unknown[];
  try {
    catalog = await loadCatalog();
    const source = spoken
      ? [{ type: 'input_text', text: `Spoken plan:\n${spoken}` }]
      : hasPhotos
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

  return planEventResponse({
    request: {
      instructions: spoken ? `${INSTRUCTIONS}\n\n${SPOKEN_INSTRUCTIONS}` : INSTRUCTIONS,
      content,
      name: 'training_plan',
      schema: buildSchema(catalog.map((e) => e.id)),
      timeoutMs: OPENAI_TIMEOUT_MS,
      fast: FAST,
    },
    reader: () => planReader(catalog, () => crypto.randomUUID()),
    giveBack,
    noPlan: 'not_a_plan',
    label: 'import',
  });
});
