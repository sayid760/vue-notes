import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from './vuex'

Vue.use(Vuex) // 1.使用这个插件的install方法

const persits = (store) => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('vuex-state', JSON.stringify(state))
  })
}

const moduleE = {
  namespaced: true,
  state: {
    name: 'xiaoming',
    age: 1
  }
}

export default new Vuex.Store({ // 导出一个store实例
  plugins: [
    persits // 发布，通知所有的订阅
  ],
  state: {
    age: 10
  },
  getters: {
    myAge (state) {
      return state.age + 18
    }
  },
  mutations: {
    syncAdd (state, payload) {
      state.age += payload
    },
    syncMinus (state, payload) {
      state.age -= payload
    }
  },
  actions: {
    asyncAdd ({ commit }, payload) {
      setTimeout(() => {
        commit('syncAdd', payload)
      }, 1000)
    },
    asyncMinus ({ commit }, payload) {
      setTimeout(() => {
        commit('syncMinus', payload)
      }, 1000)
    }
  },
  modules: {
    // 将模块挂载到根store
    moduleE, // 等同于moduleE : 等同于moduleE, 上面模块的命名空间是moduleE
    // eee: moduleE, // 下面模块的命名空间是 eee
    a: {
      state: { a: 1 },
      modules: {
        c: {
          getters: { // 所有的getters 都会定义在根上
            computedC (state) {
              return state.c + 100
            }
          },
          state: { c: 1 },
          mutations: { // 多个模块之间有同名的方法，会依次执行
            // this.mutations[syncAdd] = [fn, fn]
            syncAdd (state, payload) {
              state.c += payload
            }
          },
          actions: {
            asyncAdd ({ commit }, payload) {
              setTimeout(() => {
                commit('syncAdd', payload)
              }, 1000)
            }
          },
          modules: {
            d: {
              state: { d: 2 }
            }
          }
        }
      }
    },
    b: {
      state: { b: 1 }
    }
  }
})
