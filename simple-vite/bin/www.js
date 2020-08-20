#! /usr/bin/env node

const createServer = require('../index')

createServer().listen(4000, () => {
	console.log('server start 4000 port', 'http://localhost:4000')
})
