import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from './vuex'

Vue.use(Vuex) // 1.使用这个插件的install方法

const persits = (store) => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('vuex-state', JSON.stringify(state))
  })
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
    sayncAdd (state, payload) {
      state.age += payload
    },
    syncMinus (state, payload) {
      state.age -= payload
    }
  },
  actions: {
    asyncMinus ({ commit }, payload) {
      setTimeout(() => {
        commit('syncMinus', payload)
      }, 1000)
    },
    asyncAdd ({ commit }, payload) {
      setTimeout(() => {
        commit('sayncAdd', payload)
      }, 1000)
    }
  },
  modules: {
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
            // this.mutations[sayncAdd] = [fn, fn]
            sayncAdd (state, payload) {
              state.c += payload
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
