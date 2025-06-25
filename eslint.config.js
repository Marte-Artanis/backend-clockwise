const js = require('@eslint/js')
const globals = require('globals')
const ts = require('typescript-eslint')

module.exports = ts.config(
  {
    // Ignore compiled output, dependencies and generated artefacts
    ignores: ['dist/**', 'build/**', '**/node_modules/**', '.prisma/**', 'src/generated/**']
  },
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, ...ts.configs.recommended],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2020,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-private-class-members': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    extends: [js.configs.recommended, ...ts.configs.recommended],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2020,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
) 