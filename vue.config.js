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
