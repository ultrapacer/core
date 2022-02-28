// this is used by the vue cli; for the uP build process
// this is just used for building the components; the build/webpack.config.js file
// is used for building the main front-end
module.exports = {
  configureWebpack: {
    resolve: {
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
    }
  }
}
