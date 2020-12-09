// 这是项目发布阶段需要引入的balel 插件
const babelPlugins = []
//判断是开发还是发布阶段
if (process.env.NODE_ENV === 'production') {
  //发布阶段
  babelPlugins.push('transform-remove-console')
}

module.exports = {

  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    ...babelPlugins
  ],
}

// ...把数组，对象解构出来