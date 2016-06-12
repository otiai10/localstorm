module.exports = {
  entry: "./src/chomex.js",
  output: {
    filename: "lib/chomex.js"
  },
  module: {
    loaders: [
      {test: /.js$/, loader: 'babel-loader'}
    ]
  },
  resolve: {
    extensions: ["", ".js"]
  }
}
