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
}

/**
 * Asks the model for an answer matching `schema`. Resolves with its text, a refusal, why it is
 * incomplete, or OpenAI's HTTP status when the request failed; throws on timeouts and network
 * errors. Logs the token usage so costs can be followed in the function logs.
 */
export async function askStructured({
  instructions,
  content,
  name,
  schema,
  timeoutMs,
}: StructuredRequest) {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions,
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name, strict: true, schema } },
      ...(OPENAI_REASONING_EFFORT ? { reasoning: { effort: OPENAI_REASONING_EFFORT } } : {}),
      store: false,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    console.error('OpenAI request failed', response.status, await response.text());
    return { upstream: response.status };
  }
  const body = (await response.json()) as ResponsesApiResult;
  console.log(
    `${name}: ${body.usage?.input_tokens ?? '?'} in, ${body.usage?.output_tokens ?? '?'} out`,
  );
  return readResponse(body);
}
