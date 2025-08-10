const { defineConfig } = require('@vue/cli-service');
const { title } = require('process');
const webpack = require('webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  // * Only used for local dev to proxy Vercel API requests to Express server to avoid CORS
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process'),
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
