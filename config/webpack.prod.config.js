const baseConfig = require('./webpack.base.config');
const { resolve } = require('path');
const { merge } = require('webpack-merge');
const rootPath = resolve(__dirname, '../');

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    index: resolve(rootPath, 'src/index.ts')
  }
});
