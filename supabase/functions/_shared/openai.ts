// The OpenAI Responses API call the functions share: an answer forced into a JSON schema, nothing
// stored on OpenAI's side. OPENAI_MODEL and OPENAI_REASONING_EFFORT override the defaults; a
// request can name its own model instead (translations use a small one).
const OPENAI_URL = 'https://api.openai.com/v1/responses';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-6.1-sol';
const OPENAI_REASONING_EFFORT = Deno.env.get('OPENAI_REASONING_EFFORT');

export const openAiConfigured = () => !!OPENAI_API_KEY;

/** OpenAI's HTTP statuses worth another attempt: timeout, conflict, rate limit, overload. */
export const PASSING_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

const TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';
const TRANSCRIBE_MODEL = Deno.env.get('OPENAI_TRANSCRIBE_MODEL') ?? 'gpt-transcribe';

/**
 * Speech to text: what is said in `audio`, with `prompt` as context for the words to expect (it
 * tells the model the topic and its terms). Resolves with the text, or OpenAI's HTTP status;
 * throws on timeouts and network errors. A request OpenAI refuses as malformed goes once more
 * without the prompt, so a model without that parameter still answers.
 */
export async function transcribe(
  audio: Blob,
  fileName: string,
  prompt: string,
  timeoutMs: number,
): Promise<{ text: string } | { upstream: number }> {
  const signal = AbortSignal.timeout(timeoutMs);
  const send = (withPrompt: boolean) => {
    const form = new FormData();
    form.append('model', TRANSCRIBE_MODEL);
    form.append('file', audio, fileName);
    if (withPrompt) form.append('prompt', prompt);
    return fetch(TRANSCRIBE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
      signal,
    });
  };
  let response = await send(true);
  if (response.status === 400) {
    console.error('OpenAI refused the transcription with its prompt', await response.text());
    response = await send(false);
  }
  if (!response.ok) {
    console.error('OpenAI transcription failed', response.status, await response.text());
    return { upstream: response.status };
  }
  const body = (await response.json()) as { text?: string };
  return { text: (body.text ?? '').trim() };
}

interface ResponseContent {
  type: string;
  text?: string;
  refusal?: string;
}

interface ResponsesApiResult {
  status?: string;
  service_tier?: string;
  output?: { type: string; content?: ResponseContent[] }[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

/** The answer text of a Responses API result, or why there is none. */
function readResponse(
  body: ResponsesApiResult,
): { text: string } | { refusal: string } | { incomplete: string } {
  if (body.status && body.status !== 'completed') return { incomplete: body.status };
  for (const item of body.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content.type === 'refusal') return { refusal: content.refusal ?? '' };
      if (content.type === 'output_text' && content.text) return { text: content.text };
    }
  }
  return { incomplete: 'no_text' };
}

export interface StructuredRequest {
  instructions: string;
  /** The user message's content parts (input_text, input_image, input_file). */
  content: unknown[];
  /** Name of the answer format, e.g. "progress_check". */
  name: string;
  schema: unknown;
  timeoutMs: number;
  /** OpenAI's Fast mode: up to 2.5× faster output at twice the token price. */
  fast?: boolean;
  /** This request's model and reasoning effort, in place of OPENAI_MODEL / _REASONING_EFFORT. */
  model?: { name: string; reasoningEffort?: string };
}

/** Sends a Responses API request; nothing of it is stored on OpenAI's side. */
const post = (body: Record<string, unknown>, signal: AbortSignal) =>
  fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, store: false }),
    signal,
  });

/** The Responses API request for an answer forced into `schema`. */
function request(
  { instructions, content, name, schema, fast, model }: StructuredRequest,
  stream: boolean,
) {
  const effort = model ? model.reasoningEffort : OPENAI_REASONING_EFFORT;
  return {
    model: model?.name ?? OPENAI_MODEL,
    instructions,
    input: [{ role: 'user', content }],
    text: { format: { type: 'json_schema', name, strict: true, schema } },
    ...(effort ? { reasoning: { effort } } : {}),
    ...(fast ? { service_tier: 'fast' } : {}),
    ...(stream ? { stream: true } : {}),
  };
}

/** Token usage, and the tier OpenAI used (Fast mode may fall back to standard when busy). */
const logUsage = (name: string, { usage, service_tier }: ResponsesApiResult) =>
  console.log(
    `${name}: ${usage?.input_tokens ?? '?'} in, ${usage?.output_tokens ?? '?'} out, ${service_tier ?? '?'}`,
  );

/**
 * Asks the model for an answer matching `schema`. Resolves with its text, a refusal, why it is
 * incomplete, or OpenAI's HTTP status when the request failed; throws on timeouts and network
 * errors. Logs the token usage so costs can be followed in the function logs.
 */
export async function askStructured(req: StructuredRequest) {
  const response = await post(request(req, false), AbortSignal.timeout(req.timeoutMs));
  if (!response.ok) {
    console.error('OpenAI request failed', response.status, await response.text());
    return { upstream: response.status };
  }
  const body = (await response.json()) as ResponsesApiResult;
  logUsage(req.name, body);
  return readResponse(body);
}

/** A Responses API output item: a message, a reasoning step or a function call. */
export interface OutputItem {
  type: string;
  [key: string]: unknown;
}

export interface ResponseUsage {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { cached_tokens?: number };
  output_tokens_details?: { reasoning_tokens?: number };
}

/** A finished response as the coach reads it. */
interface CoachResult {
  status?: string;
  output?: OutputItem[];
  usage?: ResponseUsage;
  service_tier?: string;
}

/**
 * A streamed Responses API request in free form (the coach sends tools and a conversation),
 * nothing stored on OpenAI's side. `onText` gets the answer text as it is written. Resolves with
 * the finished response's output items and usage, or OpenAI's HTTP status and error text; throws
 * on timeouts, network errors and `signal`.
 */
export async function respondStream(
  body: Record<string, unknown>,
  options: { timeoutMs: number; signal?: AbortSignal; onText?: (text: string) => void },
) {
  const timeout = AbortSignal.timeout(options.timeoutMs);
  const response = await post(
    { ...body, stream: true },
    options.signal ? AbortSignal.any([options.signal, timeout]) : timeout,
  );
  if (!response.ok || !response.body) {
    const error = await response.text();
    console.error('OpenAI request failed', response.status, error);
    return { upstream: response.status, error };
  }
  // The time OpenAI says it took to start answering; the rest of the wait is network.
  const processingMs = Number(response.headers.get('openai-processing-ms')) || null;
  const finished = (result: CoachResult, status: string) => ({
    status: result.status ?? status,
    output: result.output ?? [],
    usage: result.usage ?? {},
    // Fast mode may fall back to standard when OpenAI is busy.
    tier: result.service_tier ?? null,
    processingMs,
  });
  for await (const item of responseEvents(response.body)) {
    const { event } = item;
    if (event.type === 'response.output_text.delta' && event.delta) {
      options.onText?.(event.delta);
    } else if (event.type === 'response.completed') {
      return finished(event.response ?? {}, 'completed');
    } else if (endedEarly(item)) {
      return finished(event.response ?? {}, event.type);
    }
  }
  return finished({}, 'cut_off');
}

/** A step of a streamed answer: more of its text, or how it ended. */
export type StreamedAnswer =
  { text: string } | { refusal: true } | { done: true } | { incomplete: string };

/**
 * Like askStructured, but the answer arrives as it is written: resolves once OpenAI accepted the
 * request (or with its HTTP status), then `answer` yields the text piece by piece and lastly how
 * it ended. Stops with `signal` (e.g. the app went away) or after `timeoutMs`, throwing in
 * `answer`.
 */
export async function streamStructured(req: StructuredRequest, signal: AbortSignal) {
  const response = await post(
    request(req, true),
    AbortSignal.any([signal, AbortSignal.timeout(req.timeoutMs)]),
  );
  if (!response.ok || !response.body) {
    console.error('OpenAI request failed', response.status, await response.text());
    return { upstream: response.status };
  }
  return { answer: streamedAnswer(response.body, req.name) };
}

interface ResponseEvent {
  type: string;
  delta?: string;
  response?: ResponsesApiResult & CoachResult;
}

/** The Responses API's server-sent events as they arrive, with each one's raw data. */
async function* responseEvents(body: ReadableStream<Uint8Array>) {
  let buffer = '';
  for await (const chunk of body.pipeThrough(new TextDecoderStream())) {
    buffer += chunk;
    let end: number;
    // Events are separated by a blank line; only their `data:` lines matter.
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const lines = buffer.slice(0, end).split('\n');
      buffer = buffer.slice(end + 2);
      const data = lines
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');
      if (!data || data === '[DONE]') continue;
      yield { event: JSON.parse(data) as ResponseEvent, data };
    }
  }
}

/** Whether the event ends the stream without a whole answer; logs it when it does. */
function endedEarly({ event, data }: { event: ResponseEvent; data: string }) {
  const early =
    event.type === 'response.incomplete' ||
    event.type === 'response.failed' ||
    event.type === 'error';
  if (early) console.error('OpenAI stream ended early', data.slice(0, 500));
  return early;
}

/** The Responses API's server-sent events, read into the steps of the answer. */
async function* streamedAnswer(
  body: ReadableStream<Uint8Array>,
  name: string,
): AsyncGenerator<StreamedAnswer> {
  for await (const item of responseEvents(body)) {
    const { event } = item;
    if (event.type === 'response.output_text.delta' && event.delta) {
      yield { text: event.delta };
    } else if (event.type === 'response.refusal.delta') {
      yield { refusal: true };
      return;
    } else if (event.type === 'response.completed') {
      logUsage(name, event.response ?? {});
      yield { done: true };
      return;
    } else if (endedEarly(item)) {
      yield { incomplete: event.response?.status ?? event.type };
      return;
    }
  }
  yield { incomplete: 'cut_off' };
}
