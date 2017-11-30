```javascript
'use strict'

var util = require('util')

let obj = {
	a: 123456,
	b: 'abcdef'
}

function test00() {
	console.log('[' + obj.a + '] [' + obj.b+ ']')
}

function test01() {
	console.log('[%s] [%s]', obj.a, obj.b)
}

function test02() {
	console._stdout.write(util.format('[%s] [%s]\n', obj.a, obj.b))
}

function test03() {
	console.log(`[${obj.a}] [${obj.b}]\n`)
}

function test04() {
	console._stdout.write(`[${obj.a}] [${obj.b}]\n`)
}

var count = 100 * 1000
;[test00, test01, test02, test03, test04].forEach(function(test) {
	let now = Date.now()
	for (let i = 0; i < count; i ++) {
		test()
	}
	var use_time = Date.now() - now
	console.error('count = %d >> use time = %d ms >> TPR = %d ms\n', count, use_time, use_time/count)
})
```

count = 100000 >> use time = 936 ms >> TPR = 0.00936 ms

count = 100000 >> use time = 1470 ms >> TPR = 0.0147 ms

count = 100000 >> use time = 1177 ms >> TPR = 0.01177 ms

count = 100000 >> use time = 1071 ms >> TPR = 0.01071 ms

count = 100000 >> use time = 820 ms >> TPR = 0.0082 ms
