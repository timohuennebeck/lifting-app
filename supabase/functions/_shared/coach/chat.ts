// One question to the coach: the model reads the rules, the user's context and the conversation,
// calls tools (the code runs them on the user's data) and then writes the answer. At most
// MAX_TOOL_ROUNDS rounds of tool calls; after that it has to answer with what it has.
import { type OutputItem, respond, type ResponseUsage } from '../openai.ts';
import type { CoachData, CoachUser } from './data.ts';
import { INSTRUCTIONS } from './prompt.ts';
import { type Chart, runTool, TOOLS } from './tools.ts';

const MAX_TOOL_ROUNDS = 3;
/** Reasoning and the answer of one request; the answers are 1–3 sentences. */
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
}

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
}

export type CoachReply =
  | { answer: string; chart: Chart | null; calls: CoachCall[]; usage: CoachUsage }
  | { error: string; detail?: string; calls: CoachCall[]; usage: CoachUsage };

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

function addUsage(total: CoachUsage, usage: ResponseUsage, tier: string | null) {
  total.requests += 1;
  if (tier === 'fast') total.fast += 1;
  total.input += usage.input_tokens ?? 0;
  total.cached += usage.input_tokens_details?.cached_tokens ?? 0;
  total.output += usage.output_tokens ?? 0;
  total.reasoning += usage.output_tokens_details?.reasoning_tokens ?? 0;
}

export async function askCoach(req: CoachRequest): Promise<CoachReply> {
  const input: unknown[] = [...replay(req.history), { role: 'user', content: req.question }];
  const calls: CoachCall[] = [];
  const usage: CoachUsage = { requests: 0, input: 0, cached: 0, output: 0, reasoning: 0, fast: 0 };
  let chart: Chart | null = null;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const reply = await respond(
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
      req.timeoutMs,
    );
    if ('upstream' in reply) {
      return { error: `openai_${reply.upstream}`, detail: reply.error, calls, usage };
    }
    addUsage(usage, reply.usage, reply.tier);

    const toolCalls = reply.output.filter((item) => item.type === 'function_call');
    if (!toolCalls.length) {
      const answer = answerOf(reply.output);
      if ('refused' in answer) return { error: 'refused', calls, usage };
      if (!answer.text) return { error: `no_answer (${reply.status})`, calls, usage };
      return { answer: answer.text, chart, calls, usage };
    }

    input.push(...reply.output);
    for (const call of toolCalls) {
      const args = parseArgs(call.arguments);
      const { chart: drawn, result } = runTool(String(call.name), args, req.data, req.user);
      // One chart per answer: the last one drawn.
      if (drawn) chart = drawn;
      calls.push({ name: String(call.name), args, result });
      input.push({
        type: 'function_call_output',
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }
  }
  return { error: 'no_answer (tool rounds)', calls, usage };
}
