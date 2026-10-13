// Lists components and hooks the React Compiler skips (it does so silently in the build, and they
// lose their automatic memoization), with the reason; exits with 1 when there is one. ESLint's
// react-hooks compiler rules catch most of these, but run a newer compiler than the app's babel
// plugin and miss a few (conditions inside a try, `new` in a default parameter).
// Usage: npm run compiler:check
const fs = require('node:fs');
const path = require('node:path');

const repo = path.join(__dirname, '..');
const babel = require('@babel/core');

const sources = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(file);
    // Web-only variants (*.web.ts[x]) aren't part of the app.
    return /\.tsx?$/.test(entry.name) && !/\.web\.tsx?$|\.d\.ts$/.test(entry.name) ? [file] : [];
  });

const skipped = [];
let compiled = 0;
for (const file of sources(path.join(repo, 'src'))) {
  const relative = path.relative(repo, file);
  try {
    babel.transformSync(fs.readFileSync(file, 'utf8'), {
      filename: file,
      babelrc: false,
      configFile: false,
      plugins: [
        ['@babel/plugin-syntax-typescript', { isTSX: file.endsWith('.tsx') }],
        [
          'babel-plugin-react-compiler',
          {
            // As in the app's build (babel-preset-expo).
            target: '19',
            logger: {
              logEvent(_, event) {
                if (event.kind === 'CompileSuccess') compiled++;
                else if (event.kind === 'CompileError' || event.kind === 'PipelineError') {
                  const line = event.fnLoc?.start?.line ?? event.detail?.loc?.start?.line ?? '?';
                  const reason = event.detail?.reason ?? event.detail?.options?.reason ?? '';
                  skipped.push(`${relative}:${line}  ${reason}`);
                }
              },
            },
          },
        ],
      ],
    });
  } catch (error) {
    skipped.push(`${relative}  ${error.message.split('\n')[0]}`);
  }
}

console.log(`${compiled} components and hooks compiled.`);
if (skipped.length) {
  console.error(`The React Compiler skips ${skipped.length}:\n${skipped.join('\n')}`);
  process.exit(1);
}
