const { readBody } = require('./utils')
const { parse } = require('es-module-lexer')  // 把语法解析成ast语法树
const MagicString = require('magic-string') // 字符串具有不变性 把字符串转成对象（可以操作ast，并在不损失注释和格式的情况下使用源图重新打印它）

/* [
    { s: 27, e: 30, ss: 0, se: 31, d: -1 },   s=> 开始  e=> 结果
    { s: 49, e: 58, ss: 32, se: 59, d: -1 },
    { s: 68, e: 79, ss: 60, se: 80, d: -1 }
]
*/

function rewriteImports(source) {
	let imports = parse(source)[0] // 第一项是静态 import 语句，第二项是动态 import
	let magicString = new MagicString(source)
	if (imports.length) { // 对import语法进行拦截
		for (let i = 0; i < imports.length; i++) { 
			let { s, e } = imports[i] // s, e  路径中xxx./App, 开始和结束的位置  
			let id = source.substring(s, e) // vue ./App
			// 当前开头是 \ 或者 .不需要重写
			if (/^[^\/\.]/.test(id)) {
				id = `/@modules/${id}`
				magicString.overwrite(s, e, id) // 操作ast，把s和e重写成id
			}
		}
	}
	return magicString.toString()  // 把对象转成字符串
}

function moduleRewritePlugin({ app, root }) {
	app.use(async (ctx, next) => {
		await next()
		// 洋葱模型

		// ctx.body 是流数据，转为字符串
		// 只处理js的
		if (ctx.body && ctx.response.is('js')) {
			let content = await readBody(ctx.body)
			// 重写内容并把结果返回出去
			const result = rewriteImports(content)
			ctx.body = result
		}
	})
}

exports.moduleRewritePlugin = moduleRewritePlugin
