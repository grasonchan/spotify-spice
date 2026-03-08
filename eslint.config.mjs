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
  js.configs.recommended,
  {
    ...importPlugin.flatConfigs.recommended,
    settings: {
      'import/resolver': {
        webpack: { config: 'webpack.common.js' },
      },
    },
  },
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  jsxA11y.flatConfigs.recommended,
  {
    settings: {
      react: {
        version: '18.3',
      },
    },
  },
  eslintConfigPrettier,
  {
    languageOptions: { ecmaVersion: 'latest' },
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom'],
          patterns: [
            'react/*',
            'react-dom/*',
            '**/lib/**/jsx-runtime.js',
            '**/lib/**/jsx-runtime.mjs',
          ],
        },
      ],
      'no-implicit-globals': 'error',
      'no-implicit-coercion': ['error', { allow: ['!!', '~'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-inner-declarations': 'error',
      'no-useless-assignment': 'error',
      eqeqeq: 'error',
      'require-await': 'error',
      'no-await-in-loop': 'error',
      'import/extensions': ['error', 'ignorePackages'],
      'import/newline-after-import': ['error'],
      'react/prop-types': ['error', { skipUndeclared: true }],
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    ignores: ['src/**'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**/*.{js,mjs,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        Spicetify: 'readonly',
        parseIcon: 'readonly',
        createIconComponent: 'readonly',
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/no-anonymous-default-export': [
        'error',
        { allowCallExpression: false },
      ],
    },
  },
  {
    files: ['src/index.js'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['**/lib/**/*'] }],
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
