const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginPrettier = require('eslint-plugin-prettier');

const logicalBlockSpacingRules = [
  {
    blankLine: 'always',
    prev: 'import',
    next: '*',
  },
  {
    blankLine: 'any',
    prev: 'import',
    next: 'import',
  },
  {
    blankLine: 'always',
    prev: ['const', 'let', 'var'],
    next: '*',
  },
  {
    blankLine: 'any',
    prev: ['const', 'let', 'var'],
    next: ['const', 'let', 'var'],
  },
  {
    blankLine: 'always',
    prev: '*',
    next: ['if', 'for', 'while', 'do', 'switch', 'try'],
  },
  {
    blankLine: 'always',
    prev: ['if', 'for', 'while', 'do', 'switch', 'try', 'block-like'],
    next: '*',
  },
  {
    blankLine: 'always',
    prev: '*',
    next: ['return', 'throw'],
  },
];

module.exports = [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.js'],
  },
  eslintConfigPrettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': 'error',
      'padding-line-between-statements': ['error', ...logicalBlockSpacingRules],
    },
  },
];
