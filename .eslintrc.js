module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
