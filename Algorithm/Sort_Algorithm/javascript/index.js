const glob = require('glob')
const path = require('path')

module.exports = glob.sync('./lib/**/*.js').reduce((object, file) => {
	object[path.basename(file).slice(0, -3)] = require(file)
	return object
}, {})
