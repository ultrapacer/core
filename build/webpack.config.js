const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const SitemapPlugin = require('sitemap-webpack-plugin').default
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const BoostrapVueLoader = require('bootstrap-vue-loader')
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
    if (process.env[n] !== undefined) keys[n] = `'${process.env[n]}'`
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
    publicPath: '/',
    assetModuleFilename: 'public/img/[name][ext]'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            // this allows for optional chaining in templates:
            compiler: require('vue-template-babel-compiler')
          }
        }]
      },
      {
        test: /\.md$/,
        use: ['vue-loader', 'vue-md-loader']
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false
            }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|webm|mp4|svg)$/,
        type: 'asset/resource'
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
      },
      {
        test: /\.(js|mjs)$/,
        enforce: 'pre',
        use: ['source-map-loader']
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
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
    })
  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'process/browser': 'process/browser.js' // this fixes issue with html2pdf.js
    },
    extensions: ['*', '.js', '.vue', '.json'],
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      http: false,
      stream: require.resolve('stream/'), // this one is used by xml2js for creation of gpx files
      crypto: false,
      os: false,
      assert: false,
      url: false,
      timers: false,
      https: false,
      util: require.resolve('util/')
    }
  },
  optimization: {
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

  // TEMPORARY -- to silence warning due to html2pdf.js 0.10.1
  ignoreWarnings: [/Failed to parse source map/]
}
module.exports = (env) => {
  if (env.mode === 'development') {
    config.devtool = 'eval-cheap-module-source-map'

    // if running in development with front end only, proxy the api to actual server
    if (env.serverless) {
      Object.assign(
        config.devServer.proxy['/api'],
        {
          target: 'https://ultrapacer.com',
          changeOrigin: true
        }
      )
    }
  }
  if (env.mode === 'production') {
    config.output.filename = 'public/js/[name].[contenthash:8].js'
    config.output.chunkFilename = 'public/js/[name].[contenthash:8].js'
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '../static'),
            to: path.resolve(__dirname, '../dist/public'),
            globOptions: {
              ignore: ['.*']
            }
          },
          // copy over rendered web component javascript:
          {
            from: path.resolve(__dirname, '../temp'),
            to: path.resolve(__dirname, '../dist/public/components'),
            globOptions: {
              ignore: ['.*', '*.html']
            }
          }
        ]
      })
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
    if (env.analyzer === 'on') {
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
