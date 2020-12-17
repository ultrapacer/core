const { VueLoaderPlugin } = require("vue-loader");
const htmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const autoprefixer = require("autoprefixer");
const path = require("path");
const webpack = require('webpack')
const keys = require('../config/keys')

// use below to allow @ alia in import statements
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

var config = {
  entry: {
    main: "./src/main.js",
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, '../dist'),
    chunkFilename: "[name].[hash].js",
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.s?css$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [autoprefixer()],
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
        loader: "file-loader",
      },
      {
        test: /\.(png|jpe?g|gif|webm|mp4|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name][contenthash:8].[ext]",
          outputPath: "public/img",
          esModule: false,
        },
      },
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true
        }
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "public/css/[name].[contenthash:8].css",
      chunkFilename: "public/css/[name].[contenthash:8].css",
    }),
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, "../src", "index.html"),
    }),
    new webpack.DefinePlugin({
      'process.env': keys
    }),
    new webpack.DefinePlugin({
      'process.env.GPXPARSE_COV': 0 // because of a bug in gpx-parse
    }),
    new FriendlyErrorsPlugin(),
  ],
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
      '@': resolve('src'),
    },
    extensions: ["*", ".js", ".vue", ".json"],
  },
  optimization: {
    moduleIds: "hashed",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: -10,
          chunks: "all",
        },
      },
    },
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080"
      }
    }
  },
  node: {
    fs: 'empty'
  },
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'eval-cheap-module-source-map'
  }
  if (argv.mode === 'production') {
    config.output.filename = 'public/js/[name].[contenthash:8].js'
    config.output.chunkFilename = 'public/js/[name].[contenthash:8].js'
    config.plugins.push(
      new CopyWebpackPlugin([{
          from: path.resolve(__dirname, '../static'),
          to: path.resolve(__dirname, '../dist/public'),
          ignore: ['.*']
      }])
    )
    config.plugins.push(
      new CleanWebpackPlugin()
    )
  }
  return config;
};
