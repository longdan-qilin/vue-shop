// 引入vue 构造函数
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    // '/login' 这个是登录的地址
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  /* 
    to 是将要访问的路径
    from 是从哪个路径跳转而来
    next 是一个函数 表示放行  next() 放行  next('/') 强制跳转
  */
  // 如果访问的是登录页 放行
  if (to.path === '/login') return next()
  // 从sessionStroage 获取保存的token的值
  const token = window.sessionStorage.getItem('token')
  // 没有token 强制跳转
  if(!token) return next('/login')
  next()
})

export default router




