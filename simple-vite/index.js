const Koa = require('koa')
const { serveStaticPlugin } = require('./plugins/serverPluginServeStatic')
const { moduleRewritePlugin } = require('./plugins/serverPluginModuleRewrite')
const { moduleResolvePlugin } = require('./plugins/serverPluginModuleResolve')
const { htmlRewritePlugin } = require('./plugins/serverPluginHtml')
const { vuePlugin } = require('./plugins/serverPluginVue')

function createServer() {
	const app = new Koa()
	// 拿到vite运行的工作目录
	const root = process.cwd()

	const context = {
		app,
		root,
	}

	// 插件的集合
	const resolvedPlugins = [
		htmlRewritePlugin,    // 4）处理解析 html
		moduleRewritePlugin,  // 2）解析import 重写路径
		moduleResolvePlugin, // 3）解析 以/@modules文件开头的内容 找到对应的结果
		vuePlugin,   // 5) 解析vue template
		serveStaticPlugin, // 1）实现静态服务功能
	]

	resolvedPlugins.forEach((plugin) => plugin(context))

	return app
}

module.exports = createServer
