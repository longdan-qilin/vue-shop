// 引入vue 构造函数
import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
const Login = () =>import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue');

// import Home from '../components/Home.vue'
const Home = () =>import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue');

// import Welcome from '../components/Welcome.vue'
const Welcome = () =>import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue');

// import Users from '../components/user/Users.vue'
const Users = () =>import(/* webpackChunkName:"user */ '../components/user/Users.vue');

// import Rights from '../components/power/Rights.vue'
const Rights = () =>import(/* webpackChunkName:"power" */ '../components/power/Rights.vue');

// import Roles from '../components/power/Roles.vue'
const Roles = () =>import(/* webpackChunkName:"power" */ '../components/power/Roles.vue');

// import Cate from '../components/goods/Cate.vue'
const Cate = () =>import(/* webpackChunkName:"goods" */ '../components/goods/Cate.vue');

// import Params from '../components/goods/Params.vue';
const Params = () =>import(/* webpackChunkName:"goods" */ '../components/goods/Params.vue');

// import GoodList from '../components/goods/List.vue';
const GoodList = () =>import(/* webpackChunkName:"goods" */ '../components/goods/List.vue');

// import Add from '../components/goods/Add.vue';
const Add = () =>import(/* webpackChunkName:"goods" */ '../components/goods/Add.vue');

// import Order from '../components/order/Order.vue';
const Order = () =>import(/* webpackChunkName:"order" */ '../components/order/Order.vue');

// import Report from '../components/report/Report.vue';
const Report = () =>import(/* webpackChunkName:"report" */ '../components/report/Report.vue');

// <!-- 最新版本的 element-ui，el-table 不需要加 row-key  就是前面2步-->

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    // '/login' 这个是登录的地址
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        // home 里添加 welcome子组件
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        {path: '/roles', component: Roles},
        {path: '/categories', component: Cate},
        {path: '/params', component: Params},
        {path: '/goods', component: GoodList},
        {path: '/goods/add', component: Add},
        {path: '/orders', component: Order},
        {path: '/reports', component: Report},
      ]
    },
  ]
})

// 挂载路由导航守卫  router 的实例
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
  if (!token) return next('/login')
  next()
})

export default router




