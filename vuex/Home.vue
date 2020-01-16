<template>
  <div class="home">
  home: {{$store.state.age}}
        {{$store.state.a.c.c}}
  mapState: {{name}}
  <button @click="add">增加</button>
  <button @click="minus">减少</button>
  <button @click="ansyMinus">增加</button>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
import Vuex from '../libs/vuex'
// import Vuex from '../libs/vuexx'

export default {
  name: 'home',
  mounted () {
    console.log(this.$store)
    // console.log(this.$store._modules)
    // setInterval(() => {
    //   this.$store.state.age += 1 // 响应式原理
    // }, 1000)
  },
  computed: {
    // ...mapState('命名空间名', ["name"])   在辅助函数mapState的第一参数上，填写上模块的命名空间名
    // ...Vuex.mapState('moduleE', {
    //   name: 'name'
    // })
    ...Vuex.mapState('moduleE', ['name'])
    // ...Vuex.mapState({ // 用法1
    //   age: state => state.age
    // })
    // ...Vuex.mapState([ // 用法2
    //   'age'
    // ])
  },
  methods: {
    add () {
      this.$store.commit('syncAdd', 10) // 提交方法
    },
    minus () {
      this.$store.dispatch('asyncMinus', 5)
    },
    ansyMinus () {
      this.$store.dispatch('asyncAdd', 2)
    }
  }
}
</script>
