// Speech to text for the coach's and the support chat's field (design "Spracheingabe"): the app
// records a question or message and sends it here; this function checks the user like coach-chat
// does (signed in, 16+, Pro), takes one of their transcriptions for the day and has OpenAI
// (OPENAI_TRANSCRIBE_MODEL) write it down. The recording is neither stored nor logged; the text
// goes back into the field to be edited.
import { decodeBase64 } from 'jsr:@std/encoding@1/base64';

import { ageFrom, hasPro } from '../_shared/account.ts';
import { admin, envLimit, refuseAiRequest, reply, requestUser } from '../_shared/common.ts';
import { transcribe } from '../_shared/openai.ts';
import { type AppLanguage, isAppLanguage } from '../_shared/plan-events.ts';
import { takePlanRequest } from '../_shared/plans.ts';

/** The coach's MIN_AGE: what is said goes to OpenAI too. */
const MIN_AGE = 16;
/** Transcriptions per user, and for everyone together, in 24 hours. */
const USER_LIMIT = envLimit('COACH_TRANSCRIBE_USER_LIMIT', 100);
const DAILY_LIMIT = envLimit('COACH_TRANSCRIBE_DAILY_LIMIT', 20000);
/** Base64 characters of a recording: about 3 MB, minutes of speech at the app's 32 kbit/s. */
const MAX_AUDIO = 4_000_000;
const TIMEOUT_MS = 30_000;
/** The recordings the app makes, by the type it names, with the file ending OpenAI goes by. */
const TYPES: Record<string, string> = {
  'audio/m4a': 'm4a',
  'audio/mp4': 'm4a',
  'audio/aac': 'm4a',
  'audio/webm': 'webm',
  'audio/wav': 'wav',
};

/** The topic and its words, in the language spoken, so names like "Bankdrücken" come out right. */
const CONTEXT: Record<AppLanguage, string> = {
  de: 'Eine Frage an den Trainings-Coach einer Fitness-App, z. B. zu Bankdrücken, Kniebeugen, Kreuzheben, Sätzen, Wiederholungen, RIR, Volumen, Körpergewicht oder dem Trainingsplan.',
  en: 'A question to the training coach of a fitness app, e.g. about bench press, squats, deadlifts, sets, reps, RIR, volume, body weight or the training plan.',
  'pt-PT':
    'Uma pergunta ao treinador de uma app de fitness, por exemplo sobre supino, agachamento, peso morto, séries, repetições, RIR, volume, peso corporal ou o plano de treino.',
  'pt-BR':
    'Uma pergunta ao treinador de um app de academia, por exemplo sobre supino, agachamento, levantamento terra, séries, repetições, RIR, volume, peso corporal ou o plano de treino.',
  ko: '피트니스 앱의 트레이닝 코치에게 하는 질문입니다. 예: 벤치프레스, 스쿼트, 데드리프트, 세트, 반복 횟수, RIR, 볼륨, 체중, 운동 계획.',
  es: 'Una pregunta al entrenador de una app de fitness, por ejemplo sobre press de banca, sentadillas, peso muerto, series, repeticiones, RIR, volumen, peso corporal o el plan de entrenamiento.',
  fr: "Une question au coach d'une appli de fitness, par exemple sur le développé couché, les squats, le soulevé de terre, les séries, les répétitions, le RIR, le volume, le poids corporel ou le programme d'entraînement.",
};

/** The same for a message to support (`topic: 'support'`), where a question's terms would mislead. */
const SUPPORT_CONTEXT: Record<AppLanguage, string> = {
  de: 'Eine Nachricht an den Support einer Fitness-App, z. B. zu einem Fehler, einer Idee, dem Abo oder dem Trainingsplan.',
  en: 'A message to the support team of a fitness app, e.g. about a bug, an idea, the subscription or the training plan.',
  'pt-PT':
    'Uma mensagem para o suporte de uma app de fitness, por exemplo sobre um erro, uma ideia, a subscrição ou o plano de treino.',
  'pt-BR':
    'Uma mensagem para o suporte de um app de academia, por exemplo sobre um erro, uma ideia, a assinatura ou o plano de treino.',
  ko: '피트니스 앱 고객 지원팀에 보내는 메시지입니다. 예: 오류, 아이디어, 구독, 운동 계획.',
  es: 'Un mensaje al soporte de una app de fitness, por ejemplo sobre un error, una idea, la suscripción o el plan de entrenamiento.',
  fr: "Un message au support d'une appli de fitness, par exemple sur un bug, une idée, l'abonnement ou le programme d'entraînement.",
};

Deno.serve(async (req) => {
  const refused = refuseAiRequest(req);
  if (refused) return refused;
  const user = await requestUser(req);
  if (!user) return reply(401, { error: 'unauthorized' });
  const body = await req.json().catch(() => null);
  const audio = typeof body?.audio === 'string' ? body.audio : '';
  const ending = TYPES[typeof body?.mimeType === 'string' ? body.mimeType : ''];
  if (!audio || !ending) return reply(400, { error: 'bad_request' });
  if (audio.length > MAX_AUDIO) return reply(413, { error: 'too_long' });

  const pro = hasPro(user.id);
  const { data: profile } = await admin
    .from('profiles')
    .select('birth_date, language')
    .eq('id', user.id)
    .maybeSingle<{ birth_date: string | null; language: string | null }>();
  // An unknown birth date counts as too young, as in coach-chat.
  const age = profile?.birth_date ? ageFrom(profile.birth_date, new Date()) : 0;
  if (!profile || age < MIN_AGE) return reply(403, { error: 'too_young' });
  if (!(await pro)) return reply(403, { error: 'not_pro' });

  const slot = await takePlanRequest(
    req,
    'transcribe',
    { perNetwork: USER_LIMIT, perDay: DAILY_LIMIT },
    user.id,
  );
  if ('refused' in slot) return slot.refused;

  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = decodeBase64(audio) as Uint8Array<ArrayBuffer>;
  } catch {
    await slot.giveBack();
    return reply(400, { error: 'bad_request' });
  }
  const language = [body.language, profile.language].find(isAppLanguage) ?? 'en';
  try {
    const result = await transcribe(
      new Blob([bytes], { type: body.mimeType }),
      `question.${ending}`,
      (body.topic === 'support' ? SUPPORT_CONTEXT : CONTEXT)[language],
      TIMEOUT_MS,
    );
    if ('upstream' in result) {
      await slot.giveBack();
      return reply(502, { error: 'failed' });
    }
    return reply(200, { text: result.text });
  } catch (error) {
    console.error('Transcribing failed', error);
    await slot.giveBack();
    return reply(502, { error: 'failed' });
  }
});
