class Compile{
    constructor(el, vm){ // el要编译的对象 vm当前vue的实例
        // el字符串选择器，dom
        this.$el = document.querySelector(el) // 相当于 #app
        this.$vm = vm

        // 编译
        if(this.$el){
            // 转换内部内容为片段Fragment
            this.$fragment = this.node2Fragment(this.$el)
            // console.log('this.$fragment')
            // console.dir(this.$fragment)
            // 执行编译
            this.compile(this.$fragment)
            // 将编译完的html结果追加到$el
            this.$el.appendChild(this.$fragment)
        }
    }

    // 将宿主元素中代码片段拿出来遍历，这样做比较高效
    node2Fragment(el){
        const frag = document.createDocumentFragment();
        // 将el中所有子元素搬家到frage中
        let child
        while(child = el.firstChild){
            frag.appendChild(child)
        }
        return frag
    }

    // 编译过程
    compile(el){
        const childNotes = el.childNodes;
        Array.from(childNotes).forEach(node=>{
            //类型判断
            if(this.isElement(node)){
                 // 元素
                console.log("编译元素"+node.nodeName);
            } else if(this.isInterpolation(node)){
                 // 文本
                console.log("编译文本"+node.textContent);
                this.compileText(node)
            }
            // 递归子节点
            if(node.childNodes && node.childNodes.length>0){
                this.compile(node);
            }
        })

    }

    // 插值表达式
    compileText(node){
        // console.log(RegExp.$1)
        // node.textContent = this.$vm.$data[RegExp.$1] // 初始化的时候，只能执行一次
        this.update(node, this.$vm, RegExp.$1, 'text')  // RegExp.$1 ==>{{age}}里面的age
    }
    // 更新函数 更新的节点、vue实例、表达式、指令名称
    // 更新的是文本、事件、还是其他东西？
    update(node, vm, exp, dir){
        // console.log('44')
        // console.log(node) // i am test
        // console.log(vm) // MyVue()
        // console.log(exp) // name
        // console.log(dir) // text
        const updaterFn=this[dir + 'Updater']  // textUpdater(){}
        // 初始化
        updaterFn && updaterFn(node,vm.$data[exp])
        // console.log('vm.$data')
        // console.log(vm.$data)
        // 依赖收集  vue实例，当前是哪个属性，Function 属性发生变化要怎么去更新
        // 实例wather，给它绑定相应的更新函数（把实例绑定到Dep静态属性target上，用来监听数据，数据有变化时，deps执行notify()通知dep去执行调用watcher里面的回调函数）
        new Watcher(vm, exp, function(params){  
            updaterFn && updaterFn(node,vm.$data[exp])
        })
    }

    textUpdater(node, value){
        // console.log('node')
        // console.log(node)
        node.textContent = value
    }

    isElement(node){
        return node.nodeType === 1;
    }
    // 插值文本
    isInterpolation(node){
        // 即是文本又是插值
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }

}