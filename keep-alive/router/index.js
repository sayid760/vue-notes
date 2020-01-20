import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { // 给每个路由添加属性
      keepAlive: true
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue'),
    meta: { // 给每个组件添加属性
      keepAlive: false
    }
  }
]

const router = new VueRouter({
  // mode: 'history',
  routes
})

export default router
