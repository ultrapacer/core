module.exports = {
  presets: [
    
      ["@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3,
      },],
      "@babel/preset-react",
      '@vue/cli-plugin-babel/preset'
    
  ],
  plugins: [
    "@babel/plugin-transform-modules-commonjs",
    "@babel/plugin-proposal-class-properties",
    '@babel/plugin-proposal-optional-chaining'
  ],
};