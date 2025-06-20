const fs = require("fs");
const webpack = require('webpack');

module.exports = {

  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser")
        // Other fallbacks if necessary...
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
        // Other global variables if necessary...
      }),
    ],
    // Any additional Webpack configurations...
  },
  chainWebpack: config => {
    config.plugin('provide').use(webpack.ProvidePlugin, [{
      Buffer: ['buffer', 'Buffer'],
    }])
  },
  devServer: {
    https: {
      key: fs.readFileSync("certs/server.key"),
      cert: fs.readFileSync("certs/server.cert"),
      ca: fs.readFileSync("certs/cert.pem"),
    },
  },

};
