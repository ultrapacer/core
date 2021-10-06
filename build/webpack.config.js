const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const SitemapPlugin = require('sitemap-webpack-plugin').default
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const BoostrapVueLoader = require('bootstrap-vue-loader')
const autoprefixer = require('autoprefixer')
const prettydata = require('pretty-data')
const path = require('path')
const webpack = require('webpack')

let keys = {}
try {
  // try loading keys from config file:
  keys = require('../config/keys')
} catch (err) {
  // set keys from environment variables
  [
    'THUNDERFOREST_API_KEY',
    'GOOGLE_ANALYTICS_KEY',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_AUDIENCE'
  ].forEach(n => {
    keys[n] = `'${process.env[n]}'`
  })
}

// use below to allow @ alia in import statements
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const config = {
  entry: {
    main: './src/main.js'
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, '../dist'),
    chunkFilename: '[name].[hash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.md$/,
        loader: 'vue-loader!vue-md-loader'
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()],
              sourceMap: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|webm|mp4|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'public/img',
          esModule: false
        }
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
    ]
  },
  plugins: [
    new BoostrapVueLoader(),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'public/css/[name].[contenthash:8].css',
      chunkFilename: 'public/css/[name].[contenthash:8].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src', 'index.html')
    }),
    new webpack.DefinePlugin({
      'process.env': keys
    }),
    new webpack.DefinePlugin({
      'process.env.GPXPARSE_COV': 0 // because of a bug in gpx-parse
    }),
    new FriendlyErrorsPlugin()
  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src')
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080'
      },
      '/tasks': {
        target: 'http://localhost:8080'
      },
      '/public/components': {
        target: 'http://localhost:8080'
      }
    }
  },
  node: {
    fs: 'empty'
  }
}
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'eval-cheap-module-source-map'
  }
  if (argv.mode === 'production') {
    config.output.filename = 'public/js/[name].[contenthash:8].js'
    config.output.chunkFilename = 'public/js/[name].[contenthash:8].js'
    config.plugins.push(
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, '../static'),
          to: path.resolve(__dirname, '../dist/public'),
          ignore: ['.*']
        },
        // copy over rendered web component javascript:
        {
          from: path.resolve(__dirname, '../temp'),
          to: path.resolve(__dirname, '../dist/public/components'),
          ignore: ['.*', '*.html']
        }
      ])
    )

    // compile sitemap with all documentation:
    const paths = ['', 'races', 'docs']
    const docs = require('../src/docs/.config').docs
    docs.forEach(d => { paths.push(`docs/${d.path}`) })
    config.plugins.push(
      new SitemapPlugin({
        base: 'https://ultrapacer.com/',
        paths,
        options: {
          filename: 'public/sitemap.xml',
          skipgzip: true,
          formatter: xml => { return prettydata.pd.xml(xml) }
        }
      })
    )
    if (argv.analyzer === 'on') {
      config.plugins.push(
        new BundleAnalyzerPlugin()
      )
    }

    config.plugins.push(
      new CleanWebpackPlugin()
    )
  }
  return config
}
