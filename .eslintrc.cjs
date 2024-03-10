/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: {
    browser: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc', 'simple-import-sort'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  },
  rules: {
    'import/first': 'error',
    'simple-import-sort/imports': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],
    quotes: ['error', 'single', { allowTemplateLiterals: false }],
    'tsdoc/syntax': 'warn'
  },
  settings: {
    'import/resolver': { typescript: true }
  }
}
