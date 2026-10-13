const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

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
    // Node scripts print their results and read their settings from the environment.
    files: ['scripts/**'],
    rules: { 'no-console': 'off', 'expo/no-env-var-destructuring': 'off' },
  },
]);
