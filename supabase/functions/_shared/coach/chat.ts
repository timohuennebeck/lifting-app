// One question to the coach: the model reads the rules, the user's context and the conversation,
// calls tools (the code runs them on the user's data) and then writes the answer, which streams
// out as it is written. At most MAX_TOOL_ROUNDS rounds of tool calls; after that it has to answer
// with what it has.
import { type OutputItem, type ResponseUsage, respondStream } from '../openai.ts';
import type { CoachData, CoachUser } from './data.ts';
import { INSTRUCTIONS } from './prompt.ts';
import { type Chart, runTool, TOOLS } from './tools.ts';

const MAX_TOOL_ROUNDS = 3;
/** Reasoning and the answer of one request; the answers are a few sentences. */
const MAX_OUTPUT_TOKENS = 4000;

export interface CoachCall {
  name: string;
  args: unknown;
  result: Record<string, unknown>;
}

/** An earlier question with its tool calls and answer, replayed for follow-ups. */
export interface CoachTurn {
  question: string;
  calls: CoachCall[];
  answer: string;
}

export interface CoachUsage {
  requests: number;
  input: number;
  cached: number;
  output: number;
  reasoning: number;
  /** Requests OpenAI served in Fast mode. */
  fast: number;
  /** Each request's wait in ms, and how long OpenAI says it took to start answering. */
  waits: { ms: number; openAiMs: number | null }[];
}

/** What the app shows while the answer comes: the design's steps, the chart, the text. */
export type CoachEvent =
  /** The model looks something up: "142 Trainings durchsucht". */
  | { type: 'searched'; tool: string; of: 'workouts' | 'weights' | 'checks'; count: number }
  /** The data is ready ("Passende Daten gefunden"), with the chart it draws, if any. */
  | { type: 'found'; chart: Chart | null }
  /** More of the answer's text. */
  | { type: 'text'; text: string }
  /** The text so far led into tool calls and isn't the answer: the app drops it. */
  | { type: 'reset' };

export interface CoachRequest {
  question: string;
  history: CoachTurn[];
  /** contextText() of the user. */
  context: string;
  data: CoachData;
  user: CoachUser;
  model: string;
  /** Reasoning effort (e.g. "low"); null leaves the model's default. */
  effort: string | null;
  /** OpenAI's Fast mode: faster output at twice the token price. */
  fast?: boolean;
  timeoutMs: number;
  /** Stops the answer, e.g. when the app went away. */
  signal?: AbortSignal;
  onEvent?: (event: CoachEvent) => void;
}

export type CoachReply =
  | { answer: string; chart: Chart | null; calls: CoachCall[]; usage: CoachUsage }
  | {
      /** upstream: OpenAI rejected a request (`usage.requests` says whether one went through). */
      error: 'upstream' | 'refused' | 'no_answer';
      detail?: string;
      calls: CoachCall[];
      usage: CoachUsage;
    };

/** Earlier turns as Responses API input: question, tool calls with their results, answer. */
function replay(turns: CoachTurn[]) {
  return turns.flatMap((turn, t) => [
    { role: 'user', content: turn.question },
    ...turn.calls.flatMap((call, c) => [
      {
        type: 'function_call',
        call_id: `t${t}c${c}`,
        name: call.name,
        arguments: JSON.stringify(call.args),
      },
      { type: 'function_call_output', call_id: `t${t}c${c}`, output: JSON.stringify(call.result) },
    ]),
    { role: 'assistant', content: turn.answer },
  ]);
}

/** The answer text of the output, or a refusal. */
function answerOf(output: OutputItem[]) {
  let text = '';
  for (const item of output) {
    if (item.type !== 'message') continue;
    for (const part of (item.content ?? []) as { type: string; text?: string }[]) {
      if (part.type === 'refusal') return { refused: true as const };
      if (part.type === 'output_text' && part.text) text += part.text;
    }
  }
  return { text: text.trim() };
}

function parseArgs(json: unknown) {
  try {
    return JSON.parse(String(json)) as unknown;
  } catch {
    return null;
  }
}

/** Which data a tool call searches, for the app's "142 Trainings durchsucht". */
function searched(name: string, args: unknown, data: CoachData): CoachEvent {
  const metric = (args as { metric?: unknown } | null)?.metric;
  if (name === 'trend' && metric === 'body_weight') {
    return { type: 'searched', tool: name, of: 'weights', count: data.weights.length };
  }
  if (name === 'trend' && metric === 'body_score') {
    return { type: 'searched', tool: name, of: 'checks', count: data.checks.length };
  }
  return { type: 'searched', tool: name, of: 'workouts', count: data.workouts.length };
}

function addUsage(
  total: CoachUsage,
  reply: { usage: ResponseUsage; tier: string | null; processingMs: number | null },
  ms: number,
) {
  total.requests += 1;
  total.input += reply.usage.input_tokens ?? 0;
  total.cached += reply.usage.input_tokens_details?.cached_tokens ?? 0;
  total.output += reply.usage.output_tokens ?? 0;
  total.reasoning += reply.usage.output_tokens_details?.reasoning_tokens ?? 0;
  if (reply.tier === 'fast') total.fast += 1;
  total.waits.push({ ms: Math.round(ms), openAiMs: reply.processingMs });
}

export async function askCoach(req: CoachRequest): Promise<CoachReply> {
  const input: unknown[] = [...replay(req.history), { role: 'user', content: req.question }];
  const calls: CoachCall[] = [];
  const usage: CoachUsage = {
    requests: 0,
    input: 0,
    cached: 0,
    output: 0,
    reasoning: 0,
    fast: 0,
    waits: [],
  };
  let chart: Chart | null = null;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    let streamed = false;
    const started = performance.now();
    const reply = await respondStream(
      {
        model: req.model,
        // Rules first, then the user's context: the rules are cached across all users.
        instructions: `${INSTRUCTIONS}\n\n${req.context}`,
        input,
        tools: TOOLS,
        tool_choice: round === MAX_TOOL_ROUNDS ? 'none' : 'auto',
        // Without storage on OpenAI's side, the reasoning travels along between tool rounds.
        include: ['reasoning.encrypted_content'],
        max_output_tokens: MAX_OUTPUT_TOKENS,
        ...(req.effort ? { reasoning: { effort: req.effort } } : {}),
        ...(req.fast ? { service_tier: 'fast' } : {}),
      },
      {
        timeoutMs: req.timeoutMs,
        signal: req.signal,
        onText: (text) => {
          streamed = true;
          req.onEvent?.({ type: 'text', text });
        },
      },
    );
    if ('upstream' in reply) {
      return { error: 'upstream', detail: `${reply.upstream} ${reply.error}`, calls, usage };
    }
    addUsage(usage, reply, performance.now() - started);
    // Cut off (a token limit, a filter) or failed: what came is no answer, nor are half calls.
    if (reply.status !== 'completed') {
      return { error: 'no_answer', detail: reply.status, calls, usage };
    }

    const toolCalls = reply.output.filter((item) => item.type === 'function_call');
    if (!toolCalls.length) {
      const answer = answerOf(reply.output);
      if ('refused' in answer) return { error: 'refused', calls, usage };
      if (!answer.text) return { error: 'no_answer', detail: reply.status, calls, usage };
      return { answer: answer.text, chart, calls, usage };
    }

    if (streamed) req.onEvent?.({ type: 'reset' });
    input.push(...reply.output);
    for (const call of toolCalls) {
      const args = parseArgs(call.arguments);
      req.onEvent?.(searched(String(call.name), args, req.data));
      const { chart: drawn, result } = runTool(String(call.name), args, req.data, req.user);
      // One chart per answer: the last one drawn.
      if (drawn) chart = drawn;
      req.onEvent?.({ type: 'found', chart: drawn });
      calls.push({ name: String(call.name), args, result });
      input.push({
        type: 'function_call_output',
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }
  }
  return { error: 'no_answer', detail: 'tool rounds', calls, usage };
}
