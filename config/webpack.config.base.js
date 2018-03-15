var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var outputFile = 'vue-epub-reader'
var globalName = 'VueEpubReader'

var config = require('../package.json')

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      },
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract('css-loader')
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'VERSION': JSON.stringify(config.version)
    }),
    new ExtractTextPlugin(outputFile + '.css')
  ]
}
