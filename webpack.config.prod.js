var config = require('./webpack.config');
var webpack = require('webpack');

config.plugins = config.plugins || [];
config.plugins.push(
  new webpack.DefinePlugin({
    "process.env": {
      "NODE_ENV": '"production"'
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
);

config.entry = ['./src/index'];

module.exports = config;