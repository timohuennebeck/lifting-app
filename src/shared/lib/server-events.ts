/**
 * Reads the server-sent events an Edge Function streams (one `data:` line of JSON each, separated
 * by a blank line), handing each to `onEvent` until it returns true: the stream is done. Resolves
 * whether it was; a stream that breaks off goes to `broke`, which throws.
 */
export async function readServerEvents<E>(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: E) => boolean | void,
  broke: (error: unknown) => never,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read().catch(broke);
    if (done) return false;
    buffer += decoder.decode(value, { stream: true });
    let end: number;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (line.startsWith('data:') && onEvent(JSON.parse(line.slice(5)) as E)) return true;
    }
  }
}
