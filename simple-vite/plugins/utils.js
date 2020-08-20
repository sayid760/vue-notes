const { Readable } = require('stream')

async function readBody(stream) {
	// 只对流进行处理
	if (stream instanceof Readable) {
		// koa 中要求所有的异步方法必须包装成 promise
		return new Promise((resolve, reject) => {
			let res = ''
			stream.on('data', (data) => {
				res += data
			})
			stream.on('end', () => {
				resolve(res)
			})
		})
	} else {
		return stream.toString()
	}
}

exports.readBody = readBody
