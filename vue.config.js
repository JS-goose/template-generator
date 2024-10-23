const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'), // For sax.js
        process: require.resolve('process/browser'), // For process
        buffer: require.resolve('buffer/'), // For Buffer (if needed)
        timers: require.resolve('timers-browserify'), // For timers
        // Add any other polyfills you might need
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
        // If you need to provide any other globals, add them here
      }),
    ],
  },
});
