const Sort = require('../../')

const originArray = Array.from({ length: 100 * 1000 }).map(() => Math.random())

Object.keys(Sort).forEach((sortName) => {
	const array = [...originArray]
	const now = Date.now()
	Sort[sortName](array)
	console.log(`${sortName}Use Time: ${Date.now() - now}ms`)
})
