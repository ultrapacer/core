// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/recommended', 
    'plugin:md/recommended',
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    'promise',
    'node',
    'import'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',


    // disable list-item-spacing rule in md/remark:
    'md/remark': [
      'error',
      {
        plugins: [
          'preset-lint-markdown-style-guide',
          ['lint-list-item-spacing', false]
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['*.md'],
      parser: 'markdown-eslint-parser'
    }
  ]
}
