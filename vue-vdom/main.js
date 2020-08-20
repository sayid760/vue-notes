// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

import { createElement as h } from './vdom/h'
import { render } from './vdom/patch'
let vnode = h('div', { id: 'wrapper', a: 1 }, h('span', { style: { color: 'red' } }, 'hello'), 'vue')

// 将虚拟节点转换成真实dom节点，最后插入到app元素中
render(vnode, document.getElementById('app'))
/*
//  实现虚拟dom，主要是一个对象来描述dom节点 jsx
createElement h
render:h=>h('') // 渲染组件或节点   ====>react中是用babel将组件中render函数内容jsx转成createElement(标签，属性，子元素)

<div id="wrapper" a=1>
    <span style>hello</span>
    vue
</div>

h('div', { id: 'wrapper', a: 1 }, h('span', { style: { color: 'red' } }, 'hello'), 'vue')

{
    type:'div',
    props:{id:'wrapper',a:1},
    children:[
        {type:'span',props:{style:{color:'red'}},children:[{type:'',props:'',children:[],text:'hello'}]},
        {type:'',props:'',children:[],text:'vue'}
    ]
}
*/
