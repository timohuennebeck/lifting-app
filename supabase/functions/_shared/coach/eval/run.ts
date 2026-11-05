// The coach eval: asks the coach the questions in cases.ts about the made-up users in
// fixtures.ts with the real model, and checks each answer: the expected tool and arguments, only
// numbers the tools returned (unless the case works them out), the question's language and a short
// answer.
// Needs OPENAI_API_KEY in supabase/functions/.env; one run is about 40 conversations.
// Usage: npm run coach:eval                                  all cases, gpt-6.1-sol at low effort
//        npm run coach:eval -- --model gpt-6-luna --effort medium
//        npm run coach:eval -- --fast                          OpenAI's Fast mode (2× the price)
//        npm run coach:eval -- --repeat 3 weight bench        cases whose id contains a word
// Writes the answers with their checks to eval/out/ (JSON, and Markdown for reading).
import { DEFAULT_MODEL } from '../../openai.ts';
import { askCoach, type CoachCall, type CoachTurn, type CoachUsage } from '../chat.ts';
import { contextText } from '../prompt.ts';
import { type Case, CASES } from './cases.ts';
import { FIXTURES } from './fixtures.ts';
import { languageOf, numbersOf, sentenceCount, unmatchedNumbers } from './grade.ts';

/** $ per million tokens (input, cached input, output), from third-party listings: check OpenAI's page. */
const PRICES: Record<string, [number, number, number]> = {
  'gpt-6.1-sol': [2, 0.2, 10],
  'gpt-6-luna': [0.1, 0.01, 0.5],
};
const TIMEOUT_MS = 120_000;
/** The tools that draw a chart or a card: the one behind an answer, where it called several. */
const CHART_TOOLS = new Set([
  'trend',
  'compare',
  'period_vs_average',
  'calendar',
  'distribution',
  'create_workout',
  'show_workout',
  'swap_exercises',
]);
const MAX_SENTENCES = 3;
/** The design's answers have 20–30 words. */
const MAX_WORDS = 50;

function options(args: string[]) {
  const opts = {
    model: Deno.env.get('OPENAI_COACH_MODEL') ?? DEFAULT_MODEL,
    // "default": send none, the model's own.
    effort: 'low' as string | null,
    repeat: 1,
    parallel: 4,
    fast: false,
    price: null as [number, number, number] | null,
    filters: [] as string[],
  };
  for (let i = 0; i < args.length; i++) {
    const value = args[i + 1];
    if (args[i] === '--model') opts.model = value;
    else if (args[i] === '--fast') {
      opts.fast = true;
      continue;
    } else if (args[i] === '--effort') opts.effort = value === 'default' ? null : value;
    else if (args[i] === '--repeat') opts.repeat = Number(value);
    else if (args[i] === '--parallel') opts.parallel = Number(value);
    else if (args[i] === '--price')
      opts.price = value.split(',').map(Number) as [number, number, number];
    else {
      opts.filters.push(args[i]);
      continue;
    }
    i++;
  }
  return opts;
}

const opts = options(Deno.args);
const label = `${opts.model}, effort ${opts.effort ?? 'default'}${opts.fast ? ', Fast mode' : ''}`;
const base = opts.price ?? PRICES[opts.model] ?? null;
// Fast mode costs twice as much per token (if OpenAI falls back to standard, this overstates).
const price = base && (opts.fast ? (base.map((p) => p * 2) as typeof base) : base);
const cost = (u: CoachUsage) =>
  price
    ? ((u.input - u.cached) * price[0] + u.cached * price[1] + u.output * price[2]) / 1e6
    : null;

interface Outcome {
  id: string;
  run: number;
  passed: boolean;
  problems: string[];
  /** The graded question alone. */
  seconds: number;
  usage: CoachUsage | null;
  cost: number | null;
  turns: { question: string; calls: { name: string; args: unknown }[]; answer: string }[];
  error?: string;
}

/** A question this slow lists its requests' waits. */
const SLOW_SECONDS = 10;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const waitsText = (waits: CoachUsage['waits']) =>
  waits
    .map((w) => `${seconds(w.ms)}${w.openAiMs == null ? '' : ` (OpenAI ${seconds(w.openAiMs)})`}`)
    .join(' + ');

const SMALL_NUMBERS = Array.from({ length: 13 }, (_, i) => i);

/** The tool behind the answer: the last chart tool called, else the last tool. */
const mainCall = (calls: CoachCall[]) =>
  calls.filter((c) => CHART_TOOLS.has(c.name)).at(-1) ?? calls.at(-1) ?? null;

function grade(c: Case, history: CoachTurn[], context: string) {
  const turn = history.at(-1)!;
  const main = mainCall(turn.calls);
  const found: string[] = [];
  if (!c.tool.includes(main?.name ?? null)) {
    found.push(
      `tool ${main?.name ?? 'none'}, expected ${c.tool.map((t) => t ?? 'none').join(' or ')}`,
    );
  } else if (c.args && main) {
    found.push(...c.args((main.args ?? {}) as Record<string, unknown>).map((p) => `args: ${p}`));
  }
  // Numbers from any turn's tools may be quoted again in a follow-up.
  const allowed = [
    ...numbersOf([
      context,
      ...history.map((t) => t.question),
      ...history.flatMap((t) => t.calls.map((x) => x.result)),
    ]),
    ...SMALL_NUMBERS,
    ...(Array.isArray(c.derives) ? c.derives : []),
  ];
  const unknown = unmatchedNumbers(turn.answer, c.language, allowed);
  if (unknown.length && c.derives !== true) {
    found.push(`numbers not from the tools: ${unknown.join(', ')}`);
  }
  const language = languageOf(turn.answer);
  if (language !== c.language) found.push(`language ${language}, expected ${c.language}`);
  const sentences = sentenceCount(turn.answer);
  const words = turn.answer.split(/\s+/).filter(Boolean).length;
  if (sentences > MAX_SENTENCES || words > MAX_WORDS) {
    found.push(`length: ${sentences} sentences, ${words} words`);
  }
  if (c.says && !c.says.test(turn.answer)) found.push(`doesn't say ${c.says}`);
  if (turn.answer.includes('?') !== !!c.asks) {
    found.push(c.asks ? "asks: doesn't ask what is meant" : 'asks: asks the user something');
  }
  return found;
}

async function runCase(c: Case, run: number): Promise<Outcome> {
  const { user, profile, data } = FIXTURES[c.user];
  const context = contextText(user, profile, data);
  const history: CoachTurn[] = [];
  const outcome = (rest: Partial<Outcome>): Outcome => ({
    id: `${c.user}/${c.id}`,
    run,
    passed: false,
    problems: [],
    seconds: 0,
    usage: null,
    cost: null,
    turns: history.map((t) => ({
      question: t.question,
      calls: t.calls.map(({ name, args }) => ({ name, args })),
      answer: t.answer,
    })),
    ...rest,
  });
  let seconds = 0;
  let usage: CoachUsage | null = null;
  for (const question of c.turns) {
    const started = performance.now();
    try {
      const reply = await askCoach({
        question,
        history,
        context,
        data,
        user,
        model: opts.model,
        effort: opts.effort,
        fast: opts.fast,
        timeoutMs: TIMEOUT_MS,
      });
      if ('error' in reply)
        return outcome({ error: `${reply.error} ${reply.detail ?? ''}`.trim() });
      seconds = (performance.now() - started) / 1000;
      usage = reply.usage;
      history.push({ question, calls: reply.calls, answer: reply.answer });
    } catch (error) {
      return outcome({ error: String(error) });
    }
  }
  const problems = grade(c, history, context);
  return outcome({
    passed: !problems.length,
    problems,
    seconds,
    usage,
    cost: usage && cost(usage),
  });
}

/** Runs the tasks `parallel` at a time, printing each outcome as it comes. */
async function pool(tasks: (() => Promise<Outcome>)[], parallel: number) {
  const outcomes: Outcome[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(parallel, tasks.length) }, async () => {
      while (next < tasks.length) {
        const o = await tasks[next++]();
        outcomes.push(o);
        const main =
          o.turns
            .at(-1)
            ?.calls.filter((x) => CHART_TOOLS.has(x.name))
            .at(-1)?.name ??
          o.turns.at(-1)?.calls.at(-1)?.name ??
          'none';
        const money = o.cost == null ? '' : `  $${o.cost.toFixed(4)}`;
        console.log(
          `${o.passed ? '✓' : '✗'} ${o.id.padEnd(30)} ${main.padEnd(18)} ${o.seconds.toFixed(1).padStart(5)} s${money}` +
            (o.error ? `\n    error: ${o.error.slice(0, 300)}` : '') +
            o.problems.map((p) => `\n    ${p}`).join('') +
            (o.seconds > SLOW_SECONDS ? `\n    requests: ${waitsText(o.usage?.waits ?? [])}` : ''),
        );
      }
    }),
  );
  return outcomes;
}

const percentile = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
};

/** How long single requests took, and how soon OpenAI started answering (its own time). */
function requestLine(answered: Outcome[]) {
  const waits = answered.flatMap((o) => o.usage?.waits ?? []);
  const ms = waits.map((w) => w.ms);
  const reported = waits.filter((w) => w.openAiMs != null);
  const average = (values: number[]) =>
    values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
  const share = reported.length
    ? `; OpenAI started answering after ${Math.round((average(reported.map((w) => w.openAiMs!)) / average(reported.map((w) => w.ms))) * 100)} % of it`
    : '';
  return `Per request: ${seconds(average(ms))} on average, ${seconds(percentile(ms, 0.9))} at p90, ${seconds(Math.max(0, ...ms))} at most${share}`;
}

function summary(outcomes: Outcome[]) {
  const answered = outcomes.filter((o) => !o.error);
  const share = (n: number) =>
    `${n}/${outcomes.length} (${Math.round((n / outcomes.length) * 100)} %)`;
  const failing = (prefix: string) =>
    outcomes.filter((o) => o.problems.some((p) => p.startsWith(prefix))).length;
  const costs = answered.map((o) => o.cost).filter((c): c is number => c != null);
  const tokens = (key: Exclude<keyof CoachUsage, 'waits'>) =>
    Math.round(
      answered.reduce((s, o) => s + (o.usage?.[key] ?? 0), 0) / Math.max(1, answered.length),
    );
  return [
    `Model ${label}, ${outcomes.length} questions`,
    `Passed ${share(outcomes.filter((o) => o.passed).length)}; errors ${outcomes.length - answered.length}`,
    `Failing: tool ${failing('tool')}, args ${failing('args')}, numbers ${failing('numbers')}, language ${failing('language')}, length ${failing('length')}, says ${failing("doesn't say")}, asks ${failing('asks')}`,
    `Time per question: ${(answered.reduce((s, o) => s + o.seconds, 0) / Math.max(1, answered.length)).toFixed(1)} s on average, ${percentile(
      answered.map((o) => o.seconds),
      0.9,
    ).toFixed(1)} s at p90`,
    `Tokens per question: ${tokens('input')} in (${tokens('cached')} cached), ${tokens('output')} out (${tokens('reasoning')} reasoning), ${tokens('requests')} requests${opts.fast ? `, ${answered.reduce((s, o) => s + (o.usage?.fast ?? 0), 0)} of ${answered.reduce((s, o) => s + (o.usage?.requests ?? 0), 0)} served in Fast mode` : ''}`,
    requestLine(answered),
    costs.length
      ? `Cost: $${(costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(4)} per question, $${costs.reduce((a, b) => a + b, 0).toFixed(2)} for the graded questions`
      : `Cost: no price for ${opts.model}; pass --price input,cached,output ($ per million tokens)`,
  ];
}

function markdown(outcomes: Outcome[], lines: string[]) {
  const blocks = outcomes.map((o) => {
    const turns = o.turns.map((t) => {
      const calls =
        t.calls.map((c) => `\`${c.name} ${JSON.stringify(c.args)}\``).join('<br>') || 'no tool';
      return `**Q:** ${t.question}\n\n${calls}\n\n**A:** ${t.answer}`;
    });
    const notes = [...(o.error ? [`error: ${o.error}`] : []), ...o.problems]
      .map((p) => `- ${p}`)
      .join('\n');
    return `### ${o.passed ? '✓' : '✗'} ${o.id}${opts.repeat > 1 ? ` (run ${o.run})` : ''}\n\n${turns.join('\n\n')}\n\n${notes}`;
  });
  return `# Coach eval\n\n${lines.join('  \n')}\n\n${blocks.join('\n\n')}\n`;
}

const cases = CASES.filter(
  (c) => !opts.filters.length || opts.filters.some((f) => c.id.includes(f)),
);
if (!cases.length) {
  console.error('No case matches.');
  Deno.exit(1);
}
if (!Deno.env.get('OPENAI_API_KEY')) {
  console.error('OPENAI_API_KEY is not set (supabase/functions/.env).');
  Deno.exit(1);
}
console.log(`${cases.length} cases × ${opts.repeat} with ${label}\n`);
const tasks = Array.from({ length: opts.repeat }, (_, run) =>
  cases.map((c) => () => runCase(c, run + 1)),
).flat();
const outcomes = (await pool(tasks, opts.parallel)).sort(
  (a, b) => a.id.localeCompare(b.id) || a.run - b.run,
);
const lines = summary(outcomes);
console.log(`\n${lines.join('\n')}`);

const out = new URL('./out/', import.meta.url);
await Deno.mkdir(out, { recursive: true });
const name = `${new Date().toISOString().slice(0, 16).replace(':', '')}-${opts.model}-${opts.effort ?? 'default'}${opts.fast ? '-fast' : ''}`;
await Deno.writeTextFile(
  new URL(`${name}.json`, out),
  JSON.stringify({ options: opts, summary: lines, outcomes }, null, 2),
);
await Deno.writeTextFile(new URL(`${name}.md`, out), markdown(outcomes, lines));
console.log(`\nAnswers: supabase/functions/_shared/coach/eval/out/${name}.md`);
