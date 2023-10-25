/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: {
    browser: true
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  }
}
