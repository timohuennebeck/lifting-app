// The OpenAI Responses API call the analyses share: an answer forced into a JSON schema, nothing
// stored on OpenAI's side. OPENAI_MODEL and OPENAI_REASONING_EFFORT override the defaults.
const OPENAI_URL = 'https://api.openai.com/v1/responses';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-6.1-sol';
const OPENAI_REASONING_EFFORT = Deno.env.get('OPENAI_REASONING_EFFORT');

export const openAiConfigured = () => !!OPENAI_API_KEY;

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
  /** Name of the answer format, e.g. "body_check". */
  name: string;
  schema: unknown;
  timeoutMs: number;
  /** OpenAI's Fast mode: up to 2.5× faster output at twice the token price. */
  fast?: boolean;
}

/** The Responses API request for an answer forced into `schema`. */
function request(
  { instructions, content, name, schema, fast }: StructuredRequest,
  stream: boolean,
) {
  return {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions,
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name, strict: true, schema } },
      ...(OPENAI_REASONING_EFFORT ? { reasoning: { effort: OPENAI_REASONING_EFFORT } } : {}),
      store: false,
      ...(fast ? { service_tier: 'fast' } : {}),
      ...(stream ? { stream: true } : {}),
    }),
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
  const response = await fetch(OPENAI_URL, {
    ...request(req, false),
    signal: AbortSignal.timeout(req.timeoutMs),
  });
  if (!response.ok) {
    console.error('OpenAI request failed', response.status, await response.text());
    return { upstream: response.status };
  }
  const body = (await response.json()) as ResponsesApiResult;
  logUsage(req.name, body);
  return readResponse(body);
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
  const response = await fetch(OPENAI_URL, {
    ...request(req, true),
    signal: AbortSignal.any([signal, AbortSignal.timeout(req.timeoutMs)]),
  });
  if (!response.ok || !response.body) {
    console.error('OpenAI request failed', response.status, await response.text());
    return { upstream: response.status };
  }
  return { answer: streamedAnswer(response.body, req.name) };
}

/** The Responses API's server-sent events, read into the steps of the answer. */
async function* streamedAnswer(
  body: ReadableStream<Uint8Array>,
  name: string,
): AsyncGenerator<StreamedAnswer> {
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
      const event = JSON.parse(data) as {
        type: string;
        delta?: string;
        response?: ResponsesApiResult;
      };
      if (event.type === 'response.output_text.delta' && event.delta) {
        yield { text: event.delta };
      } else if (event.type === 'response.refusal.delta') {
        yield { refusal: true };
        return;
      } else if (event.type === 'response.completed') {
        logUsage(name, event.response ?? {});
        yield { done: true };
        return;
      } else if (
        event.type === 'response.incomplete' ||
        event.type === 'response.failed' ||
        event.type === 'error'
      ) {
        console.error('OpenAI stream ended early', data.slice(0, 500));
        yield { incomplete: event.response?.status ?? event.type };
        return;
      }
    }
  }
  yield { incomplete: 'cut_off' };
}
