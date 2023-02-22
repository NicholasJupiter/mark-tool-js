const webpack = require('webpack')
// const { name } = require('../package.json')
const { resolve } = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const rootPath = resolve(__dirname, '../')

module.exports = {
  output: {
    filename: '[name].min.js',
    path: resolve(rootPath, 'dist'),
    library: 'MarkToolJs',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /.(less|css)$/i,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin()
  ]
}
