import globals from 'globals';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'script' },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        Spicetify: 'readonly',
        parseIcon: 'readonly',
        createIconComponent: 'readonly',
      },
    },
  },
  js.configs.recommended,
  {
    ...react.configs.flat.recommended,
    plugins: { react },
    settings: {
      react: {
        version: '18.3',
      },
    },
  },
  reactHooks.configs['recommended-latest'],
  jsxA11y.flatConfigs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-implicit-globals': 'error',
      'no-implicit-coercion': ['error', { allow: ['!!', '~'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-inner-declarations': 'error',
      'no-useless-assignment': 'error',
      eqeqeq: 'error',
      'require-await': 'error',
      'no-await-in-loop': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];
