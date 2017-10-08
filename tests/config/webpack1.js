var path = require('path')
module.exports = {
  entry: {
    main: [path.resolve(process.cwd(), 'src/entry.js')]
  },
  output: {
    publicPath: '',
    filename: 'js/[name].[hash:7].js',
    chunkFilename: 'js/[id].[hash:7].js',
    path: path.resolve(process.cwd(), 'dist')
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 1,
          name: 'img/[name].[hash:7].[ext]'
        }
      }]
  }
}