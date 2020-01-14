let Vue

class ModuleCollection {
  constructor (options) {
    // console.log(options)
    this.register([], options)
  }
  register (path, rootModule) {
    // console.log(path) // [] ["a"] ["b"]
    let module = { // 将模块格式化
      _rawModule: rootModule,
      _children: {},
      state: rootModule.state
    }
    if (path.length === 0) { // 如果是根模块，将这个模块挂载到根实例上
      this.root = module
    } else {
      // 递归调用reduce方法 [a] 找出c的父级，再挂上去
      let parent = path.slice(0, -1).reduce((root, current) => {
        console.log(current)
        return root._children[current]
      }, this.root)
      // console.log(parent)
      // this.root._children[path[path.length - 1]] = module
      parent._children[path[path.length - 1]] = module
    }
    // 看当前模块是否有modules
    // console.log(rootModule.modules) // {a: {…}, b: {…}}    {c: {…}}
    if (rootModule.modules) { // 如果有modules 开始重新再次注册
      forEach(rootModule.modules, (moduleName, module) => {
        // console.log(module)
        this.register(path.concat(moduleName), module) // [a] [b]
      })
    }
  }
}

const forEach = (obj, cb) => {
  Object.keys(obj).forEach(key => {
    cb(key, obj[key])
  })
}

class Store {
  constructor (options = {}) {
    // 将用户的状态放到store中
    // this.state = options.state
    this.s = new Vue({ // 核心 定义了响应式变化 数据更新 更新视图
      data () {
        return { state: options.state }
      }
    })
    let getters = options.getters // 放的是getters的方法
    // let getters = {}
    this.getters = {}
    // 计算属性
    /*  Object.keys(getters).forEach(getterName => {
      Object.defineProperty(this.getters, getterName, {
        get: () => {
          return getters[getterName](this.state)
        }
      })
    })
    */
    forEach(getters, (getterName, fn) => {
      Object.defineProperty(this.getters, getterName, {
        get: () => {
          return fn(this.state)
        }
      })
    })

    // this.mutations = options.mutations
    // 在mutations里面定义好方法(把所有方法都挂在mutations上)，触发的时候找到对应的方法，然后执行
    let mutations = options.mutations // 获取所有的同步的更新操作方法
    this.mutations = {}
    /* Object.keys(mutations).forEach((mutationName) => {
      this.mutations[mutationName] = (payload) => {
        mutations[mutationName](this.state, payload)
      }
    })
    */
    forEach(mutations, (mutationName, fn) => {
      this.mutations[mutationName] = (payload) => {
        fn(this.state, payload)
      }
    })
    let actions = options.actions // 获取所有的异步的更新操作方法
    this.actions = {}
    forEach(actions, (actionName, fn) => {
      this.actions[actionName] = (payload) => {
        fn(this, payload)
      }
    })
    // 把数据格式化成一个想要的数据
    this._modules = new ModuleCollection(options)
  }
  commit = (mutationName, payload) => {
    this.mutations[mutationName](payload)
  }
  dispatch = (actionName, payload) => {
    this.actions[actionName](payload)
  }
  get state () { // 类的属性访问器
    return this.s.state
  }
}

const install = (_Vue) => { // 把vue传进来使用他的方法
  Vue = _Vue
  // vue的组件渲染顺序
  Vue.mixin({
    // 创建之前会被执行
    beforeCreate () {
    //   console.log('ok')
      // console.log(this.$options)
      // 需要拿到store，给每个组件都增加$store属性
      // this.$options && this.$options.store 只有根实例有，其他组件没有
      if (this.$options && this.$options.store) {
        // 给根实例增加$store属性
        this.$store = this.$options.store
      } else {
        // 有可能单独创建了一个实例没有父亲 那就无法获取store属性
        this.$store = this.$parent && this.$parent.$store
      }
    }
  })
}

export default {
  install, // 给用户提供一个install方法，默认会被调用
  Store
}

/*
// modules 源码
let root = {
  _raw: options,
  _children: {
    a: {
      _raw: {},
      _children: {},
      state: { a: 1 }
    },
    b: {}
  },
  state: options.state
}
*/
/**
 * 1、给每个组件设置Store()
 * 给每个组件的生命周期都混入beforeCreate，如果实例上有store属性，就把实例放到根上，
 * 其他的组件再去他们的父节点上去找
 * 2、把state、getter都挂上去
 * 3、解决响应式 setInterval()
 * 4、mutation的commit方法：把所有mutation异步方法都挂在mutations上，定义一个commit方法，触发的时候（根据名字）找到对应的方法，然后执行
 * 5、action的dispatch方法：同上
 * 6、modules模块
 *    modules里面还有modules的情况
 *    多个模块之间有同名的mutation、action方法，会依次执行 this.mutations[sayncAdd] = [fn, fn]
 */
