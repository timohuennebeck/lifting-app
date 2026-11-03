import { File } from 'expo-file-system';

import { postFunction, refusalOf } from '@/shared/data/edge-functions';
import { supabase } from '@/shared/data/supabase';

/** Why a recording didn't become text; each has its message in coach.json (voice.errors). */
export type TranscribeFailure = 'offline' | 'failed' | 'limit' | 'notPro' | 'tooYoung';

export class TranscribeError extends Error {
  constructor(readonly reason: TranscribeFailure) {
    super(`Transcribing the question failed: ${reason}`);
  }
}

const REFUSALS: Record<string, TranscribeFailure> = {
  limit: 'limit',
  not_pro: 'notPro',
  too_young: 'tooYoung',
};

/**
 * What is said in the recording at `uri` (an .m4a), written down by the coach-transcribe function
 * in `language`; '' when nothing was heard. Throws a TranscribeError with the reason otherwise.
 */
export async function transcribeQuestion(uri: string, language: string) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new TranscribeError('failed');
  const audio = await new File(uri).base64();
  const response = await postFunction(
    'coach-transcribe',
    { audio, mimeType: 'audio/m4a', language },
    { token: data.session.access_token, offline: () => new TranscribeError('offline') },
  );
  if (!response.ok) {
    const { error } = await refusalOf('coach-transcribe', response);
    throw new TranscribeError(REFUSALS[error ?? ''] ?? 'failed');
  }
  const { text } = (await response.json()) as { text?: string };
  return text ?? '';
}
