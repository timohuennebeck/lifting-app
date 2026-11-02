/**
 * A streamed answer as server-sent events: `run` sends events until it is done; when it throws,
 * `broke` decides what the app hears. Cancelling (the app went away) aborts `run`'s signal, which
 * stops the model too; anything sent after that is dropped.
 */
export function eventStream<E>(
  run: (send: (event: E) => void, signal: AbortSignal) => Promise<unknown>,
  broke: (error: unknown, send: (event: E) => void, aborted: boolean) => unknown,
) {
  // Not the request's signal: Deno also aborts that once a response is delivered.
  const stop = new AbortController();
  const encoder = new TextEncoder();
  const events = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: E) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // The app went away: `cancel` below stops the run.
        }
      };
      void run(send, stop.signal)
        .catch((error) => broke(error, send, stop.signal.aborted))
        .finally(() => {
          try {
            controller.close();
          } catch {
            // Already closed because the app went away.
          }
        });
    },
    cancel: () => stop.abort(),
  });
  return new Response(events, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      // Proxies pass each event on right away instead of collecting the answer.
      'X-Accel-Buffering': 'no',
    },
  });
}
