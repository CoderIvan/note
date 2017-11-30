const glob = require('glob')
const path = require('path')

glob.sync('./lib/*.js').forEach(file => {
	module.exports[path.basename(file).slice(0, -3)] = require(file)
})
