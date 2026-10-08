/** Steps in the "Create plan" branch (goal … plan name). */
export const CREATE_STEPS = 6;

export const DURATION = { min: 10, max: 120, step: 5 } as const;
export const DURATION_PRESETS = [30, 45, 60, 75, 90] as const;
export const PLAN_NAME_MAX = 30;
