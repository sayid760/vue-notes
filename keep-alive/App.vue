<template>
  <div id="app">
    <!-- 1）keep-alive应用在路由中  
    <div id="nav">
      <router-link tag="div" to="/">home</router-link> &nbsp;&nbsp;&nbsp; 
      <router-link tag="div" to="/about">about</router-link>
    </div> 
     添加哪些需要记录缓存，哪些不需要
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"/>
    </keep-alive> -->

    <!--2）keep-alive应用在动态组件中
    <ul>
        <li @click="currentView='Home'">home</li>
        <li @click="currentView='About'">About</li>
    </ul>
     a，b这两个组件需要记录缓存
    <keep-alive include="Home, About" :exclude="blackList" :max="amount">
      <component :is="currentView"></component>
    </keep-alive> -->

    <!-- sKeepAlive测试 -->
    <div id="nav">
      <router-link to="/">home</router-link>
      <router-link to="/about">about</router-link>
    </div>
    keep-alive：<keep-alive>
      <router-view />
    </keep-alive>
    <p> ------------------------------------ </p>
    s-keep-alive：<s-keep-alive include="home">
      <router-view />
    </s-keep-alive>
   
  </div>
</template>

<script>
import About from './views/About'
import Home from './views/Home'
import sKeepAlive from './sKeepAlive/index.js'

export default {
  data () {
    return {
      currentView: 'About',
      blackList: '',
      amount: 1
    }
  },
  components: {
    Home, About, sKeepAlive
  }
}
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
