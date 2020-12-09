module.exports = {
  css: {
    extract: false
  },
  chainWebpack: config => {
    // 如果编译模式是发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // 清除默认的入口文件，添加新的入口文件
      config.entry('app').clear().add('./src/main-prods.js')
      // 设置不需要打包的依赖项，从外部加载这些依赖项的CDN资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 设置首页内容判断编译模式的条件
      config.plugin('html').tap((args) => {
        args[0].isProd = true
        return args
      })
    })
    // 如果编译模式是开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      // 清除默认的入口文件，添加新的入口文件
      config.entry('app').clear().add('./src/main-dev.js')
   
      // 设置首页内容判断编译模式的条件
      config.plugin('html').tap((args) => {
        args[0].isProd = false
        return args
      })
    })
  }
}