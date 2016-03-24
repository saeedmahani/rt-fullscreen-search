var config = require('./webpack.config.base');
var webpack = require('webpack');

config.plugins = config.plugins || [];
config.plugins.push(
  new webpack.DefinePlugin({
    "process.env": {
      "NODE_ENV": '"development"'
    }
  })
);

module.exports = config;