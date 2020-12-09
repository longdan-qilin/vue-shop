import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入表单下拉的组件 因为ele.ui没有
import TreeTable from 'vue-table-with-tree-grid'
// 导入时间过滤器
import './filter/data.js'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require style  对应的富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入进度条插件
import NProgress from 'nprogress'
//导入进度条样式
import 'nprogress/nprogress.css'

//你运行的Vu是开发模式。为生产部署时，请确保启用生产模式
Vue.config.productionTip = false

// 导入axios这个包
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器添加token 保证拥有获取数据的权限 预处理
axios.interceptors.request.use(config => {
  // 请求 拦截器的时候 显示进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  console.log(config);
  return config
})

// 响应拦截器的时候 隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  // console.log(config);
  return config
},err  => conslole.log(err))

// 把这个包挂载这个原型对象上 这样 每个vue的组件度可以通过this直接访问$http 而去发起axios请求
Vue.prototype.$http = axios
// 挂载vue实例
Vue.component('tree-table', TreeTable)

//将富文本编辑器 注册为全局的可用组件
Vue.use(VueQuillEditor)
// render函数是vue通过js渲染dom结构的函数createElement，约定可以简写为h
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// render: function (createElement) {
//   return createElement(App);
// }
