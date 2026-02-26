import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores(['SpotifySpice/']),
  { files: ['**/*.{js,mjs,jsx}'] },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'module' },
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
    ...importPlugin.flatConfigs.recommended,
    settings: {
      'import/resolver': 'webpack',
    },
  },
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
    languageOptions: { ecmaVersion: 'latest' },
  },
  {
    rules: {
      'no-restricted-imports': ['error', 'react', 'react-dom'],
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
      'import/extensions': ['error', 'ignorePackages'],
      'import/newline-after-import': ['error'],
    },
  },
  {
    files: ['src/**/*{js,mjs,jsx}'],
    rules: {
      'import/no-anonymous-default-export': [
        'error',
        { allowCallExpression: false },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,jsx}'],
    ignores: ['src/index.js', 'src/lib/**/*.{js,mjs}'],
    rules: {
      'no-restricted-globals': ['error', 'Spicetify'],
    },
  },
];
