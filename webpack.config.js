
module.exports = {
  entry: {
    dock: './src/dock/index.js',
    water: './src/water/index.js'
  },
  output: {
    path: __dirname + '/public',
    filename: '[name]/index.bundle.js'
  },
  devServer: {
    port: 3000,
    contentBase: __dirname + '/public/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader : 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
