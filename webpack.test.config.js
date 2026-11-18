module.exports = {
  mode: 'development',
  resolve: {
    // Exclude Node-only paths in the browser WASM dependency.
    fallback: { fs: false, crypto: false },
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
