module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['tests/**/*.js'],
    plugins: ['karma-webpack', 'karma-chrome-launcher', 'karma-mocha', 'karma-chai'],
    webpack: require('./webpack.test.config'),
    preprocessors: {
      'tests/**/*.js': ['webpack'],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
  })
};
