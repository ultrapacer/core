/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: {
    browser: true
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  plugins: ['simple-import-sort'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  },
  rules: {
    'import/first': 'error',
    'simple-import-sort/imports': 'error',
    'prefer-const': ['error', { destructuring: 'all' }]
  }
}
