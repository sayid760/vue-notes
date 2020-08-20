const static = require('koa-static')
const path = require('path')

// 静态服务插件
function serveStaticPlugin({ app, root }) {
	app.use(static(root))
	// vite在哪里运行，就以哪个目录启动静态服务（即以根目录的index.html为静态服务）
	app.use(static(path.join(root, 'public')))
}

exports.serveStaticPlugin = serveStaticPlugin
