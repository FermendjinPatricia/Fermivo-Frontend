const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true, 
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      swSrc: './public/service-worker.js',
    },
    filenameHashing: false
  }
});
