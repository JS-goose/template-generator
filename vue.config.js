const { defineConfig } = require('@vue/cli-service');
const { title } = require('process');
const webpack = require('webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process'), // * Fixed line for process
        buffer: require.resolve('buffer/'),
        timers: require.resolve('timers-browserify'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  },
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Cloudinary RSS Mailer'
    }
  }
});
