module.exports = {
  entry: './src/server/server.js',
  target: 'node',
  output: {
    path: __dirname + '/dist',
    filename: 'server.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader']
      },
      {
        test: /\.json$/,
        loaders: ['json-loader']
      }
    ]
  }
};
