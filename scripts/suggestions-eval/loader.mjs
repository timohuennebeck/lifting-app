// Lets Node load the app's TypeScript for the eval: "@/…" resolves to src/…, and an import
// without an extension finds its .ts file. Registered with node:module's register() before the
// rules are imported.
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = join(import.meta.dirname, '../../src');
const CANDIDATES = ['', '.ts', '.tsx', '/index.ts'];

const isFile = (path) => existsSync(path) && statSync(path).isFile();

export async function resolve(specifier, context, nextResolve) {
  let base = null;
  if (specifier.startsWith('@/')) base = join(SRC, specifier.slice(2));
  else if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    base = join(dirname(fileURLToPath(context.parentURL)), specifier);
  }
  const found = base && CANDIDATES.map((ext) => base + ext).find(isFile);
  if (!found) return nextResolve(specifier, context);
  const url = pathToFileURL(found).href;
  // The app's files are ES modules; saying so spares Node guessing (and warning) for each one.
  if (found.endsWith('.ts')) return { url, format: 'module-typescript', shortCircuit: true };
  return nextResolve(url, context);
}
