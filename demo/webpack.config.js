module.exports = {
  mode: 'development',
  watch: true,
  resolve: {
    modules: [
      '../node_modules',
    ],
  },
  entry: {
    app: './demo.js',
  },
  output: {
    filename: 'app.js',
  },
};
