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
    this.register([], rootModule)
  }
  register (path, rootModule) { // 将模块格式化
    let newModule = {
      _raw: rootModule,
      _children: rootModule.modules,
      state: rootModule.state
    }

    if (path.length === 0) { // 如果是根模块，将这个模块挂载到根实例上
      this.root = newModule
    } else {
      // 递归调用reduce方法 [a] 找出c的父级，再挂上去
      let parent = path.slice(0, -1).reduce((pre, cur) => {
        return pre._children[cur]
      }, this.root)
      parent._children[path[path.length - 1]] = newModule
    }
    // 看当前模块是否有modules
    // console.log(rootModule.modules) // {a: {…}, b: {…}}    {c: {…}}
    if (rootModule.modules) { // 如果有modules 开始重新再次注册
      forEach(rootModule.modules, (moduleName, value) => {
        this.register(path.concat(moduleName), value) // [a] [b]
      })
    }
  }
}

/** 安装模块 */
const installModule = (store, state, path, rootModule) => {
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
        store._subscribes.forEach(fn => fn({ type: mutationName, payload }, state))
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
    /** 格式化用户传入的数据 */
    this.modules = new ModuleCollection(this._options)
    /**
      递归将结果进行分类
      this 整个store
      this.state 当前的根状态
      [] 为了递归来创建的  等下要递归把每个getters都放到根上
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

    options.plugins.forEach(plugin => plugin(this))
  }
  get state () { // 类的属性访问器
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
const install = (vm, options) => { // 把vue传进来使用他的方法
  _Vue = vm
  // vue的组件渲染顺序
  _Vue.mixin({
    beforeCreate () {
      // 需要拿到store，给每个组件都增加$store属性
      // this.$options && this.$options.store 只有根实例有，其他组件没有
      if (this.$parent) {
        // 有可能单独创建了一个实例没有父亲 那就无法获取store属性
        this.$store = this.$parent.$store
      } else {
        // 给根实例增加$store属性
        this.$store = this.$options && this.$options.store
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
