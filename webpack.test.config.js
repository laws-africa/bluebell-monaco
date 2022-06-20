module.exports = {
  mode: 'development',
  resolve: {
    modules: ["node_modules", './'],
    extensions: [".js"]
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['css-loader']
    }],
  }
};
