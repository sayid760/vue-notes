<template>
  <div>
    home:
    <input :value="inputVal">
    {{inputVal}}
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      inputVal: ''
    }
  },
  activated () { 
    console.log('activated页面打开时触发')
  },
  deactivated () {
    console.log('deactivated页面关闭时触发')
  },
  created () {
    console.log('created')
    // console.log('sssssssss')
    // console.log(this.$router)
    // console.log(this.router)
  }
}
</script>

<style lang="scss" scoped>

</style>
