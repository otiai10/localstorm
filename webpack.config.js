module.exports = {
  entry: "./src/chomex.js",
  output: {
    path: "lib",
    filename: "chomex.js"
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
