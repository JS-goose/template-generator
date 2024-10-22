const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        timers: false, // ignore timers module
        stream: false, // ignore stream module 
      }
    }
  }
})
