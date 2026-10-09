/** Resolves after `ms` milliseconds, e.g. to simulate a mocked service's latency. */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
