<template>
  <div class="home">
  home:  {{$store.state.age}}
          {{$store.state.a.c.c}}
  <button @click="add">增加</button>
  <button @click="minus">减少</button>
  <button @click="ansyMinus">增加</button>

  </div>
</template>

<script>
export default {
  name: 'home',
  mounted () {
    console.log(this.$store)
    // setInterval(() => {
    //   this.$store.state.age += 1 // 响应式原理
    // }, 1000)
  },
  methods: {
    add () {
      this.$store.commit('sayncAdd', 10) // 提交方法
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
