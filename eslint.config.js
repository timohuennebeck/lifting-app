const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', 'design/*', 'supabase/*', 'powersync/*', 'src/uniwind-types.d.ts'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // The TypeScript plugin only applies to TypeScript files, so plain JS (scripts) lints too.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  {
    // The React Compiler silently skips a component or hook it can't compile, which then loses its
    // automatic memoization. The plugin's compiler is newer than the app's, so a few still slip
    // through: conditions inside a try, `new` in a default parameter, disabled React rules.
    files: ['src/**'],
    rules: {
      'react-hooks/todo': 'error',
      'react-hooks/hooks': 'error',
      'react-hooks/unsupported-syntax': 'error',
      'react-hooks/syntax': 'error',
      'react-hooks/invariant': 'error',
    },
  },
  {
    // Node scripts print their results and read their settings from the environment.
    files: ['scripts/**'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off', 'expo/no-env-var-destructuring': 'off' },
  },
]);
