const baseConfig = require('./webpack.base.config')
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { merge } = require('webpack-merge')
const rootPath = resolve(__dirname, '../')

module.exports = merge(baseConfig, {
  mode: 'development',
  entry: {
    index: resolve(rootPath, 'demo/index.js')
  },
  devServer: {
    static: {
      directory: resolve(rootPath, 'dist')
    },
    compress: true,
    port: 9000
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve(rootPath, 'demo/index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(rootPath, './demo/assets/'),
          to: resolve(rootPath, './assets/dist/')
        }
      ]
    })
  ]
})
