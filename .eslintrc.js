export default {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: ['eslint:recommended'],
  plugins: ['node'],
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
