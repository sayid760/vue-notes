class MyVue{
    constructor(options){
        this.options = options

        // 处理data选项
        this.$data = options.data

        //响应化
        this.observer(this.$data)

    /*    // 测试
        // 新创建watcher以后去读取属性
        new Watcher() // new一个watcher，实例就指向了Dep.target
        this.$data.test // 读了test属性，defineReactive()里面的getter立即执行，所以Dep.target就被加到new Dep()出来的deps里面，相当于在test的deps加了依赖
        new Watcher()  
        this.$data.foo.bar
        */

        new Compile(options.el, this)

        // created执行
        if(options.created){
            options.created.call(this) // 为什么created里面可以用this的原因
        }

    }
    // 观察者
    observer(value){
        // console.log(value)
        if(!value || typeof value !=='object') return

        // 遍历对象
        Object.keys(value).forEach(key=>{
            console.log('value----------->')
            console.log(value)
            console.log(key)
            console.log(value[key])

            // console.log(key) // name  age  html
            this.defineReactive(value, key, value[key])
            // 代理data中的属性挂到vue实例上
            this.proxyData(key)
        })
    }
    // 数据响应化
    defineReactive(obj,key,val){
        const dep=new Dep()
        // console.dir(Dep)
        /**
         * set某个key的时候去通知依赖，每个依赖都有单独的dep和它相对应
         */
        Object.defineProperty(obj,key,{
            get(){
                // 收集依赖，将dep.taeget添加到dep中
                // 意思是如果有watcher就有dep.target，那就把dep.target添加到dep
                // console.log('deps------>')
                // console.log(Dep.target)
                Dep.target && dep.addDep(Dep.target) // 当创建watcher的时候读某个属性，就把依赖添加到deps里面去，到时候改变就知道去通知谁
                // console.log(dep.deps);
                return val
            },
            set(newVal){
                if(newVal !=val){
                    val=newVal
                    console.log(`更新了：${newVal}`)
                    // 通知依赖，做更新
                    dep.notify();
                }
            }
        })

        this.observer(val) // 递归
    }
    cb(val) {
        console.log("刷新数据：" + val)
    }
    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key]
            },
            set(newVal){
                this.$data[key]=newVal
            }
        })
    }
}

// 依赖管理器：负责将视图中所有依赖收集管理，包括依赖添加和通知（订阅者 Dep，存放观察者对象）
class Dep{
    constructor(){
        this.deps = []  // deps里面存放的是Watcher的实例
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach(dep=>dep.update()) // 遍历一下，让它调用自己的更新函数
    }
}

class Watcher{
    constructor(vm, key, cb){
        this.vm = vm
        this.key = key
        this.cb = cb
        // 将来new一个监听器时，将当前Watcher实例附加到Dep.target
        // 将当前watcher实例指定到Dep静态属性target,于是dep就有了update方法
        // 利用这种方式在组件之间进行通信
        Dep.target = this 
        this.vm[this.key] // 触发getter,添加依赖
        Dep.target = null // 避免重复添加
    }
    update(){
        console.log('闪开，我要更新啦~~')
        this.cb.call(this.vm, this.vm[this.key])
    }
}