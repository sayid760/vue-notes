/**
 * @param {*} vnode 虚拟节点
 * @param {*} container 渲染到哪个容器中
 */
export function render (vnode, container) {
  let ele = createDomElementFromVnode(vnode) // 把虚拟节点转换成新的节点
  container.appendChild(ele)
}

// 通过虚拟的对象，创建一个真实的dom
function createDomElementFromVnode (vnode) {
  // debugger;
  // 1、通过类型创建元素
  // 1.1 根据类型创建标签或者文本
  // 1.2 将属性props添加到真实dom上
  let { type, key, props, children, text } = vnode
  console.log(key, props, children)
  if (type) { // 有类型说明是一个标签，没有则是文本
    // 建立虚拟节点和真实节点的对应关系
    // 在虚拟节点上记录真实节点,让创建的dom跟虚拟节点有对应关系，要更新虚拟节点的时候就可以找到对应dom
    vnode.domElement = document.createElement(type)
    // 更新属性
    updateProperties(vnode) // 根据当前的虚拟节点的属性，去更新真实的dom元素
    // children中放的也是一个个虚拟节点
    children.forEach(childVnode => render(childVnode, vnode.domElement))
  } else { // 文本
    vnode.domElement = document.createTextNode(text)
  }
  return vnode.domElement
}
/*

/* 比对的时候，会根据老的属性和新的属性重新更新节点
  新：<div id="container" a=1 style="color:red"></div>
  老：<div id="container"></div>
*/
function updateProperties (newVnode, oldProps = {}) {
  let domElement = newVnode.domElement || {}// 真实的dom元素
  let newProps = newVnode.props // 当前虚拟节点中的属性
  // 如果老的里面有 新的里面没有 这个属性就被移除
  for (let oldPropName in oldProps) {
    if (!(newProps in oldProps)) {
      delete domElement[oldPropName]
    }
  }
  // 如果新的里面有style 老的里面也有style style有可能不一样 老的有background 新的里面没有background
  let newStyleObj = newProps.style || {}
  let oldStyleObj = oldProps.style || {}
  for (let propName in oldStyleObj) { // 老的上面有
    if (!newStyleObj[propName]) { // 新的里面没有
      domElement.style[propName] = '' // 要删掉
    }
  }
  // 如果来的里面没有 新的里面有 用新节点的覆盖老节点的
  for (let newPropName in newProps) {
    if (newPropName === 'style') {
      let styleObj = newProps.style
      // console.log(styleObj) // {color: "red"}
      for (let s in styleObj) {
        domElement.style = {}
        domElement.style[s] = styleObj[s]
      }
    } else {
      domElement[newPropName] = newProps[newPropName]
    }
  }
}
