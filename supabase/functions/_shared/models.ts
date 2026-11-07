// Which OpenAI model each feature asks, with its reasoning effort and Fast mode, all in one place.
// A change here reaches the hosted project with a deploy of the functions that use it.
// npm run plan:lab compares models and efforts for the plan generation; npm run plan:eval checks
// the reading of plans and spoken exercises, npm run coach:eval the coach.
// Plain TypeScript without Deno APIs, so the plan lab can read it too.

/** How a feature asks OpenAI. */
export interface ModelChoice {
  name: string;
  /** The reasoning effort: "none" (if the model takes it) up to "max". */
  reasoningEffort: string;
  /** OpenAI's Fast mode: up to 2.5× faster output at twice the token price. */
  fast: boolean;
}

export const MODELS = {
  /** generate-plan: the plan from the plan flow's answers. */
  generatePlan: { name: 'gpt-6.1-sol', reasoningEffort: 'low', fast: true },
  /** read-workout-file, step "plan": a file's plan rows. */
  readPlan: { name: 'gpt-6-luna', reasoningEffort: 'low', fast: true },
  /** read-workout-file, steps "categorize", "map" and "name": a workout file's sheets and names. */
  readFile: { name: 'gpt-6-luna', reasoningEffort: 'low', fast: true },
  /** read-exercises: exercises the user said (voice input). */
  readSpoken: { name: 'gpt-6-luna', reasoningEffort: 'low', fast: true },
  /** assess-progress: a progress check's photos. */
  progressCheck: { name: 'gpt-6.1-sol', reasoningEffort: 'medium', fast: false },
  /** coach-chat. */
  coach: { name: 'gpt-6.1-sol', reasoningEffort: 'low', fast: true },
  /** Support messages (translate-ticket-messages, send-team-reply). */
  translate: { name: 'gpt-6-luna', reasoningEffort: 'none', fast: false },
} satisfies Record<string, ModelChoice>;

/** Speech to text for the coach's field (coach-transcribe). */
export const TRANSCRIBE_MODEL = 'gpt-transcribe';
