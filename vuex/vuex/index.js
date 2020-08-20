/**
 * 1、给每个组件设置Store()
 * 给每个组件的生命周期都混入beforeCreate，如果实例上有store属性，就把实例放到根上，
 * 其他的组件再去他们的父节点上去找
 * 2、把state、getter都挂上去
 * 3、解决响应式 setInterval()
 * 4、mutation的commit方法：把所有mutation同步方法都挂在mutations上，定义一个commit方法，触发的时候（根据名字）找到对应的方法，然后执行
 * 5、action的dispatch方法：同上
 * 6、modules模块
 *    modules里面还有modules的情况
 *    多个模块之间有同名的mutation、action方法，会依次执行 this.mutations[sayncAdd] = [fn, fn]
 *    所有的getters 都会定义在根上
 * 7、plugins模块
 */

let _Vue
/** 简化代码，封装遍历方法 */
const forEach = (obj, callback) => {
  Object.keys(obj).forEach((key) => {
    callback(key, obj[key])
  })
}

class ModuleCollection {
  constructor (rootModule) {
    // 注册模块
    this.register([], rootModule)
  }
  register (path, rootModule) { // 将模块格式化
    let newModule = {
      namespaced: rootModule.namespaced ? rootModule.namespaced : false,
      _raw: rootModule,
      _children: rootModule.modules,
      state: rootModule.state
    }

    if (path.length === 0) { // 如果是根模块，将这个模块挂载到根实例上
      this.root = newModule
    } else {
      // 递归调用reduce方法 [a] 找出c的父级，再挂上去
      /* path      path.slice(0, -1)   pre   cur
        [a]              []
        [a, c]           [a]                  a
        [a, c, d]       [a, c]                a
        [a, c, d]                             c
      */
      let parent = path.slice(0, -1).reduce((pre, cur) => { // pre 初始值  cur 当前元素
        return pre._children[cur] // 递归把children挂载在父级别的_children属性下
      }, this.root)
      parent._children[path[path.length - 1]] = newModule
    }
    // 遍历注册子模块
    // console.log(rootModule.modules) // {a: {…}, b: {…}}    {c: {…}}    {d: {…}}
    if (rootModule.modules) { // 如果有modules 开始重新再次注册
      forEach(rootModule.modules, (moduleName, value) => {
        this.register(path.concat(moduleName), value) // 循环两次，第一次[a]，第二次[b] ,而不是[a,b]
      })
    }
  }
  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module._children[key]
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }
}

/** 安装模块 */
const installModule = (store, state, path, rootModule) => {
  const namespace = store.modules.getNamespace(path)
  if (rootModule.namespaced) {
    store._modulesNamespaceMap[namespace] = rootModule
  }

  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((pre, cur) => {
      return pre[cur]
    }, store.state)
    /** 利用Vue set方法实现数据绑定 */
    // vue不能在对象上增加不存在的属性，否则不会导致视图更新，要用set方法实现数据绑定
    _Vue.set(parent, path[path.length - 1], rootModule.state)
  }

  let getters = rootModule._raw.getters
  if (getters) {
    forEach(getters, (getterName, fn) => {
      Object.defineProperty(store.getters, getterName, {
        get () {
          // 让getter执行自己的状态 传入
          return fn(state)
        }
      })
    })
  }

  let mutations = rootModule._raw.mutations
  if (mutations) {
    forEach(mutations, (mutationName, fn) => {
      store.mutations[mutationName] || (store.mutations[mutationName] = [])
      store.mutations[mutationName].push((payload) => {
        fn(state, payload)
        // 发布 让所有订阅依次执行
        store._subscribes.forEach(fn => fn({ type: mutationName, payload }, store.state))
      })
    })
  }

  let actions = rootModule._raw.actions
  if (actions) {
    forEach(actions, (actionName, fn) => {
      store.actions[actionName] || (store.actions[actionName] = [])
      store.actions[actionName].push((payload) => {
        fn(store, payload)
      })
    })
  }

  // 挂载儿子
  if (rootModule._children) {
    forEach(rootModule._children, (moduleName, module) => {
      installModule(store, module.state, path.concat(moduleName), module)
    })
  }
}

class Store {
  constructor (options) {
    // 将用户的状态放到store中
    // this.state = options.state
    /** 借用Vue的双向绑定机制让Vuex中data变化实时更新界面 */
    this.vm = new _Vue({
      data: {
        state: options.state
      }
    })
    // 只循环一次，现在需要把子modules里面的getters、mutations、actions都放到对应的对象里
    /** 保存一份到本身实例 */
    this._options = options
    /** 保存getters */
    this.getters = {}
    this.mutations = {}
    this.actions = {}
    this._subscribes = []
    this._modulesNamespaceMap = {} // 存放命名空间模块
    /** 格式化用户传入的数据 */
    this.modules = new ModuleCollection(this._options) // 把数据格式化我们想要的树
    /**
      递归将结果进行分类
      this 整个store
      this.state 当前的根状态
      [] 为了递归来创建的  等下要递归把每个state都放到根上
      this._modules.root 从根模块开始安装
     */
    installModule(this, this.state, [], this.modules.root)
    // let getters = this._options.getters || {}
    /** 遍历保存传入的getters，监听状态改变重新执行该函数 */
    // forEach(getters, (getterName, fn) => {
    //     Object.defineProperty(this.getters, getterName, {
    //         get: () => {
    //             return fn(this.state)
    //         }
    //     })
    // })

    /** 保存mutations */
    // this.mutations = {};
    // let mutations = this._options.mutations || {};
    // forEach(mutations, (mutationName, fn) => {
    //     this.mutations[mutationName] = (payload) => {
    //         return fn(this.state, payload)
    //     }
    // })
    // this.actions = {};
    /** 保存actions */
    //
    // let actions = this._options.actions || {};
    // forEach(actions, (actionName, fn) => {
    //     this.actions[actionName] = (payload) => {
    //         return fn(this, payload)
    //     }
    // })
    // 实例store的时候，遍历plugins里面的函数，并执行 this.subscribe() 订阅
    options.plugins.forEach(plugin => plugin(this))
  }
  /* 类的属性访问器
    访问state对象时候，就直接返回响应式的数据
    Object.defineProperty get 同理
  */
  get state () {
    return this.vm.state
  }
  commit = (type, payload) => {
    this.mutations[type].forEach(fn => fn(payload))
  }
  dispatch = (type, payload) => {
    this.actions[type].forEach(fn => fn(payload))
  }
  subscribe (fn) {
    this._subscribes.push(fn) // 订阅
  }
}

const install = (vm, options) => {
  _Vue = vm
  // 使用vue的混入方法，在创建之前，给每个组件都增加$store属性
  _Vue.mixin({
    // 创建之前会被执行
    beforeCreate () {
      // 根实例有store属性
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store
      } else {
        // 根实例上没有的store属性，往父亲节点找
        // new Vue({store}) 这里已经在根组件挂载有store属性
        this.$store = this.$parent && this.$parent.$store
      }
    }
  })
}

// mapState得到的会是一个对象
const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        // state = module.context.state
        // getters = module.context.getters
        /** 这里做了偷懒，实际上还需要注册module的时候挂载一个上下文
         *  上下文里的Object.definedProperty来劫持做响应式数据，具体参考源码module模块安装
        */
        state = module._raw.state
        getters = module._raw.state
      }
      return typeof val === 'function' ? val.call(this, state, getters) : state[val]
    }
    res[key].vuex = true
  })
  return res
})

// 在这里把传进来的函数的参数处理一下，再返回函数
function normalizeNamespace (fn) { // 在这里做一层包装，返回给mapState
  return (namespace, map) => { // namespace {age: ƒ}
    if (typeof namespace !== 'string') { // 判断是否为命名空间用法，...mapState('命名空间名', ["name"])
      map = namespace // 把namespace赋值给map
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') { // 如果是命名空间模块，就加斜杆
      namespace += '/' // ====> moduleE/
    }
    return fn(namespace, map) // normalizeNamespace()主要是对namespace和map参数做处理再传给fn()
  }
}

// 获取根模块下对应的namespace
function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace] // store._modulesNamespaceMap['moduleE/'] 下的module
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}

function normalizeMap (map) {
  if (!isValidMap(map)) {
    return []
  }
  Object.keys(map).map(key => {
    return { key, val: map[key] }
  })
  return Array.isArray(map) ? map.map(key => ({ key, val: key })) : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function isValidMap (map) {
  return Array.isArray(map) || (map !== null && typeof map === 'object') // 如果是array返回array，否则返回对象
}

export default {
  install, // 给用户提供一个install方法，默认会被调用
  Store,
  mapState
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
