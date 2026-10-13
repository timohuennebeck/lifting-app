// Analyses a body check: the app uploads the three photos to
// body-checks/<user id>/<check id>/<pose>.jpg, then calls this function with the check id.
// The photos go to OpenAI's Responses API; the answer is either the check's values or
// the photos to retake. Every analysis takes a row in body_check_analyses first, which limits how
// often a user can run one and is the only source the saved check's values are taken from.
import { encodeBase64 } from 'jsr:@std/encoding@1/base64';

import { admin, reply, requestUser } from '../_shared/common.ts';
import { askStructured, openAiConfigured } from '../_shared/openai.ts';
import {
  ageFrom,
  type AnalysisProfile,
  contextText,
  INSTRUCTIONS,
  modelInput,
  type ModelOutput,
  type Photos,
  POSES,
  type PreviousCheck,
  SCHEMA,
  toAnalysis,
  type WeightEntryRow,
  weightHistorySince,
} from './analysis.ts';

const BUCKET = 'body-checks';
/** Same rule as the app (features/body-check/lib/eligibility.ts). */
const MIN_AGE = 18;
/** Analyses per user in 24 hours, retakes included; each one is an OpenAI call. */
const DAILY_LIMIT = 5;
const OPENAI_TIMEOUT_MS = 120_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REVENUECAT_SECRET_KEY = Deno.env.get('REVENUECAT_SECRET_KEY');
/** RevenueCat entitlement that unlocks Traqa Pro (same as the app). */
const PRO_ENTITLEMENT = 'pro';

async function photoDataUrl(path: string) {
  const { data, error } = await admin.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return `data:image/jpeg;base64,${encodeBase64(new Uint8Array(await data.arrayBuffer()))}`;
}

/** A check's photos that are in storage, as data URLs. */
async function checkPhotos(userId: string, checkId: string): Promise<Partial<Photos>> {
  const urls = await Promise.all(
    POSES.map((pose) => photoDataUrl(`${userId}/${checkId}/${pose}.jpg`)),
  );
  return Object.fromEntries(POSES.flatMap((pose, i) => (urls[i] ? [[pose, urls[i]]] : [])));
}

/**
 * Whether RevenueCat lists an active Pro entitlement for the user. Without a key (local
 * development) or when RevenueCat can't be reached it lets the analysis through: the app shows
 * the paywall itself, this only keeps the OpenAI cost to paying users.
 */
async function hasPro(userId: string) {
  if (!REVENUECAT_SECRET_KEY) return true;
  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      console.error('Checking Pro with RevenueCat failed', response.status, await response.text());
      return true;
    }
    const entitlement = (await response.json()).subscriber?.entitlements?.[PRO_ENTITLEMENT];
    if (!entitlement) return false;
    // No expiry date = lifetime.
    return entitlement.expires_date === null || Date.parse(entitlement.expires_date) > Date.now();
  } catch (error) {
    console.error('Checking Pro with RevenueCat failed', error);
    return true;
  }
}

const askModel = (content: ReturnType<typeof modelInput>) =>
  askStructured({
    instructions: INSTRUCTIONS,
    content,
    name: 'body_check',
    schema: SCHEMA,
    timeoutMs: OPENAI_TIMEOUT_MS,
  });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!openAiConfigured()) {
    console.error('OPENAI_API_KEY is not set (supabase/functions/.env)');
    return reply(500, { error: 'not_configured' });
  }

  const userId = (await requestUser(req))?.id;
  if (!userId) return reply(401, { error: 'unauthorized' });

  const { checkId } = await req.json().catch(() => ({}));
  if (typeof checkId !== 'string' || !UUID.test(checkId)) {
    return reply(400, { error: 'bad_request' });
  }

  // Started together: the Pro check (RevenueCat) and the photos don't depend on the rows. The
  // answers are still checked in order (age, Pro, photos).
  const pro = hasPro(userId);
  const ownPhotos = checkPhotos(userId, checkId);
  // Awaited below; until then a failed download mustn't count as an unhandled rejection.
  ownPhotos.catch(() => {});
  const [{ data: profile }, { data: weights }, { data: previous }] = await Promise.all([
    admin
      .from('profiles')
      .select('sex, birth_date, height_cm, experience')
      .eq('id', userId)
      .maybeSingle<AnalysisProfile>(),
    admin
      .from('weight_entries')
      .select('date, weight_kg')
      .eq('user_id', userId)
      .gte('date', weightHistorySince(new Date()))
      .order('date'),
    admin
      .from('body_checks')
      .select('id, created_at, group_scores, metrics')
      .eq('user_id', userId)
      .neq('id', checkId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<PreviousCheck>(),
  ]);
  // An unknown birth date counts as under age. On the 18th birthday east of UTC this still says
  // no for those first hours (the app goes by the local date).
  const age = profile?.birth_date ? ageFrom(profile.birth_date, new Date()) : 0;
  if (age < MIN_AGE) return reply(403, { error: 'not_adult' });
  if (!(await pro)) return reply(403, { error: 'not_pro' });

  // The previous check's photos let the model compare pose by pose; one that fails to download
  // is left out.
  const [photos, previousPhotos] = await Promise.all([
    ownPhotos,
    previous ? checkPhotos(userId, previous.id) : {},
  ]);
  if (POSES.some((pose) => !photos[pose])) return reply(400, { error: 'photos_missing' });

  // The analysis takes one of the day's slots before OpenAI is called (in one locked step, so
  // parallel requests can't share the last one); a call OpenAI rejected gives it back.
  const { data: slot, error: slotError } = await admin.rpc('start_body_check_analysis', {
    p_user_id: userId,
    p_check_id: checkId,
    p_daily_limit: DAILY_LIMIT,
  });
  if (slotError) {
    console.error('Starting the analysis failed', slotError);
    return reply(500, { error: 'analysis_failed' });
  }
  if (!slot) return reply(429, { error: 'limit' });

  const finish = (status: 'ok' | 'retake' | 'refused' | 'failed', result: unknown = null) =>
    admin.from('body_check_analyses').update({ status, result }).eq('id', slot);
  const giveBack = () => admin.from('body_check_analyses').delete().eq('id', slot);

  let answer: Awaited<ReturnType<typeof askModel>>;
  try {
    const context = contextText(profile, (weights ?? []) as WeightEntryRow[], previous, new Date());
    answer = await askModel(modelInput(context, photos as Photos, previousPhotos));
  } catch (error) {
    // A timeout may still have been billed, so the slot stays used.
    console.error('OpenAI request failed', error);
    await finish('failed');
    return reply(502, { error: 'analysis_failed' });
  }
  // OpenAI's status (wrong key, unknown model, …) helps tell what went wrong in the app's log.
  if ('upstream' in answer) {
    await giveBack();
    return reply(502, { error: 'analysis_failed', upstream: answer.upstream });
  }
  if ('refusal' in answer) {
    console.warn('The model refused the photos', answer.refusal);
    await finish('refused');
    return reply(422, { error: 'refused' });
  }
  if ('incomplete' in answer) {
    console.error('The analysis did not complete', answer.incomplete);
    await finish('failed');
    return reply(502, { error: 'analysis_failed' });
  }

  let analysis: ReturnType<typeof toAnalysis>;
  try {
    analysis = toAnalysis(JSON.parse(answer.text) as ModelOutput);
  } catch (error) {
    console.error('The analysis answer could not be read', error);
    await finish('failed');
    return reply(502, { error: 'analysis_failed' });
  }

  const { error } = await finish(
    analysis.status,
    analysis.status === 'ok' ? analysis.result : { issues: analysis.issues },
  );
  if (error) {
    console.error('Saving the analysis failed', error);
    return reply(500, { error: 'analysis_failed' });
  }
  return reply(200, analysis);
});
