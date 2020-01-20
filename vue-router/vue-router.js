/**
 * 1、配置hash、history路由，传进来的参数有哪些
 * 2、匹配到对应的路由表
 * 3、渲染视图
 */
class HistoryRoute {
  constructor () {
    this.current = null
    console.log(this.current)
  }
}

class VueRouter {
  constructor (options) {
    this.mode = options.mode || 'hash'
    this.routes = options.routes || []
    // 把数组变成下面的对象
    // 你传递的这个路由表是一个数组 {'/home':Home , '/about':About}
    this.routesMap = this.createMap(this.routes)
    console.log(this.routesMap)
    // 路由中需要存放当前的路径 需要状态
    // this.history = { current: null } // 每次切换，把里面的值变成 {current:'/home'} {current:'/about'}
    this.history = new HistoryRoute()
    // 把内容渲染到页面
    this.init() // 开始初始化操作
  }
  init () {
    if (this.mode === 'hash') {
      // 先判断用户打开时有没有hash 没有就跳转到 #/
      location.hash ? '' : location.hash = '/'
      window.addEventListener('load', () => {
        // 在页面进来时初始化html
        this.history.current = location.hash.slice(1) // 去掉＃号
      })
      window.addEventListener('hashchange', () => { // 判断网页状态是否改变
        this.history.current = location.hash.slice(1)
      })
    } else {
      location.pathname ? '' : location.pathname = '/'
      window.addEventListener('load', () => {
        this.history.current = location.pathname
      })
      window.addEventListener('popstate', () => {
        this.history.current = location.pathname
      })
    }
  }
  go () {
  }
  back () {
  }
  push () {
  }
  createMap (routes) {
    return routes.reduce((memo, current) => {
      memo[current.path] = current.component
      return memo
    }, {})
  }
}

VueRouter.install = function (Vue, opts) {
  // 每个组件的实例都有this.$router / this.roue这两个属性
  // 所有组件中怎么拿到同一个路由的实例
  Vue.mixin({
    beforeCreate () {
      // 获取组件的属性名字
      // 给当前实例定义$router属性
      if (this.$options && this.$options.router) { //  定位根组件
        // this._root = this // 把当前实例挂载在_root上   this==> vue
        Object.defineProperty(this, '_root', { // Router的实例
          get () {
            return this
          }
        })
        this._router = this.$options.router // 把router实例挂载在_router上
        // observer方法 深度劫持
        /**
         * 如果history中的current属性变化 也会刷新视图
         * this.xxx = this._router.history
         */
        Vue.util.defineReactive(this, 'xxx', this._router.history)
      } else {
        // vue组件的渲染顺序 父->子->孙子
        // this._root = this.$parent._root // 如果想获取唯一的路由实例this._root._router
        Object.defineProperty(this, '_root', { // Router的实例
          get () {
            return this.$parent._root
          }
        })
      }
      Object.defineProperty(this, '$router', { // Router的实例
        get () {
          return this._root._router
        }
      })
      Object.defineProperty(this, '$route', {
        get () {
          return {
            // 当前的路由所在的状态
            current: this._root._router.history.current
          }
        }
      })
    }
  })
  Vue.component('router-link', {
    props: {
      to: String,
      tag: String
    },
    methods: {
      handleClick () {
        // mode === 'hash' ? `#${this.to}` : this.to
        // 如果是hash怎么跳转 如果是history怎么跳转
        let mode = this._self._root._router.mode
        // let current = this._self.$router.history.current
        if (mode === 'hash') {
          // this.href = `#${this.to}`
          this._self.$router.history.current = `#${this.to}`
        } else {
          this._self.$router.history.current = this.to
        }
      }
    },
    // jxs用法
    render (h) {
      // return h('a', {}, '首页') // react createElement
      let mode = this._self._root._router.mode
      let tag = this.tag || 'a'
      // 深度渲染
      return <tag on-click={this.handleClick} href={mode === 'hash' ? `#${this.to}` : this.to}>{this.$slots.default}</tag>
    }
  })
  // 根据current(当前路径)找出对应的组件，通过渲染函数render渲染出来
  Vue.component('router-view', { // 根据当前的状态 current路由表{'/about':About}
    render (h) {
      console.log(this)
      // 如何将current变成动态的 current变化应该会影响视图刷新
      // vue事项双向绑定 Object.defineProperty set get
      let current = this._self.$router.history.current
      let routesMap = this._self.$router.routesMap
      console.log(routesMap)
      return h(routesMap[current])
    }
  })
}

export default VueRouter
