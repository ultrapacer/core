// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  env: {
    browser: true
  },
  extends: [
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'promise',
    'import'
  ],
  rules: {
    'generator-star-spacing': 'off',

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
