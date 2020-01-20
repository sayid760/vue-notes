/**
 * 实现include、exclude、max详细内容，请参考vue.js源码
 */
import Vue from 'vue'
const sKeepAlive = Vue.component('s-keep-alive', {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: String,
    exclude: String,
    max: [String, Number]
  },
  created () {
    this.cache = Object.create(null)
    this.keys = []
  },
  destroyed () {
  },
  mounted () {
    // var this$1 = this
    this.$watch('include', function (val) {
      // pruneCache(this$1, function (name) { return matches(val, name) })
    })
    this.$watch('exclude', function (val) {
      // pruneCache(this$1, function (name) { return !matches(val, name) })
    })
  },
  // jxs用法
  render (h) {
    var slot = this.$slots.default
    var vnode = getFirstComponentChild(slot)
    var componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      var ref$1 = this
      var cache = ref$1.cache
      var keys = ref$1.keys
      var key = vnode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ('::' + (componentOptions.tag)) : '')
        : vnode.key
      // 如果已经做过缓存了则直接从缓存中获取组件实例给vnode，还未缓存过则进行缓存
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
      }
      vnode.data.keepAlive = true // 加标签，渲染的时候判断是否为true，true的话不再进入$mount过程，即生命周期的钩子函数都不会被触发
    }
    return vnode || (slot && slot[0]) // 返回vnode
  }
})

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

export default sKeepAlive
