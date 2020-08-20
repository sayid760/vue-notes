const data = {
    name: 'xiaoming',
    age: 20,
}
// const data = ['a', 'b', 'c']

const proxyData = new Proxy(data, {
    get(target, key, receiver) { // receiver指的是proxyData对象
        console.log(receiver) 
        console.log(this) 
        // 只处理本身（非原型的）属性
        const ownKeys = Reflect.ownKeys(target)
        if (ownKeys.includes(key)) {
            console.log('get', key) // 监听
        }

        // Reflect.get()使
        const result = Reflect.get(target, key, receiver) //  这里的receiver this指的是get()的第三个参数
        return result // 返回结果
    },
    set(target, key, val, receiver) {
        // 重复的数据，不处理
        if (val === target[key]) {
            return true
        }

        const result = Reflect.set(target, key, val, receiver)
        console.log('set', key, val)
        // console.log('result', result) // true
        return result // 是否设置成功
    },
    deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key)
        console.log('delete property', key)
        // console.log('result', result) // true
        return result // 是否删除成功
    }
})

