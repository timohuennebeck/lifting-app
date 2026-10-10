// Analyses a body check: the app uploads the three photos to
// body-checks/<user id>/<check id>/<pose>.jpg, then calls this function with the check id.
// The photos go to OpenAI (EU endpoint by default); the answer is either the check's values or
// the photos to retake. Every analysis is logged in body_check_analyses, which limits how often
// a user can run one and is the only source the saved check's values are taken from.
import { encodeBase64 } from 'jsr:@std/encoding@1/base64';
import { createClient } from 'jsr:@supabase/supabase-js@2';

import {
  type AnalysisProfile,
  contextText,
  INSTRUCTIONS,
  type ModelOutput,
  POSES,
  type PreviousCheck,
  readResponse,
  SCHEMA,
  toAnalysis,
} from './analysis.ts';

const BUCKET = 'body-checks';
/** Same rule as the app (features/body-check/lib/eligibility.ts). */
const MIN_AGE = 18;
/** Analyses per user in 24 hours, retakes included; each one is an OpenAI call. */
const DAILY_LIMIT = 5;
const DAY_MS = 86_400_000;
const OPENAI_TIMEOUT_MS = 120_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
// EU data residency needs an OpenAI project created in the EU region.
const OPENAI_BASE_URL = Deno.env.get('OPENAI_BASE_URL') ?? 'https://eu.api.openai.com/v1';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-6.1-sol';
const OPENAI_REASONING_EFFORT = Deno.env.get('OPENAI_REASONING_EFFORT');

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function photoDataUrl(path: string) {
  const { data, error } = await admin.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return `data:image/jpeg;base64,${encodeBase64(new Uint8Array(await data.arrayBuffer()))}`;
}

async function askModel(context: string, photos: string[]) {
  const content = [
    { type: 'input_text', text: context },
    ...POSES.flatMap((pose, i) => [
      { type: 'input_text', text: `${pose} photo:` },
      { type: 'input_image', image_url: photos[i], detail: 'high' },
    ]),
  ];
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: INSTRUCTIONS,
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name: 'body_check', strict: true, schema: SCHEMA } },
      ...(OPENAI_REASONING_EFFORT ? { reasoning: { effort: OPENAI_REASONING_EFFORT } } : {}),
      // Nothing about the photos is kept for later retrieval.
      store: false,
    }),
    signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
  });
  if (!response.ok) {
    console.error('OpenAI request failed', response.status, await response.text());
    return null;
  }
  return readResponse(await response.json());
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return reply(500, { error: 'analysis_failed' });
  }

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const { data: auth } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  const userId = auth.user?.id;
  if (!userId) return reply(401, { error: 'unauthorized' });

  const { checkId } = await req.json().catch(() => ({}));
  if (typeof checkId !== 'string' || !UUID.test(checkId)) {
    return reply(400, { error: 'bad_request' });
  }

  const [{ data: profile }, { data: previous }, { count }] = await Promise.all([
    admin
      .from('profiles')
      .select('sex, age, height_cm, weight_kg, experience')
      .eq('id', userId)
      .maybeSingle<AnalysisProfile>(),
    admin
      .from('body_checks')
      .select('created_at, group_scores, metrics')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<PreviousCheck>(),
    admin
      .from('body_check_analyses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - DAY_MS).toISOString()),
  ]);

  if ((profile?.age ?? 0) < MIN_AGE) return reply(403, { error: 'not_adult' });
  if ((count ?? 0) >= DAILY_LIMIT) return reply(429, { error: 'limit' });

  const photos = await Promise.all(
    POSES.map((pose) => photoDataUrl(`${userId}/${checkId}/${pose}.jpg`)),
  );
  if (photos.some((p) => !p)) return reply(400, { error: 'photos_missing' });

  let answer: Awaited<ReturnType<typeof askModel>>;
  try {
    answer = await askModel(contextText(profile, previous, new Date()), photos as string[]);
  } catch (error) {
    console.error('OpenAI request failed', error);
    return reply(502, { error: 'analysis_failed' });
  }
  if (!answer) return reply(502, { error: 'analysis_failed' });

  const log = (status: 'ok' | 'retake' | 'refused', result: unknown = null) =>
    admin
      .from('body_check_analyses')
      .insert({ user_id: userId, check_id: checkId, status, result });

  if ('refusal' in answer) {
    console.warn('The model refused the photos', answer.refusal);
    await log('refused');
    return reply(422, { error: 'refused' });
  }
  if ('incomplete' in answer) {
    console.error('The analysis did not complete', answer.incomplete);
    return reply(502, { error: 'analysis_failed' });
  }

  let analysis: ReturnType<typeof toAnalysis>;
  try {
    analysis = toAnalysis(JSON.parse(answer.text) as ModelOutput);
  } catch (error) {
    console.error('The analysis answer could not be read', error);
    return reply(502, { error: 'analysis_failed' });
  }

  const { error } = await log(
    analysis.status,
    analysis.status === 'ok' ? analysis.result : { issues: analysis.issues },
  );
  if (error) {
    console.error('Logging the analysis failed', error);
    return reply(500, { error: 'analysis_failed' });
  }
  return reply(200, analysis);
});
