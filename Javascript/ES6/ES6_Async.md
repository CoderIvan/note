# ES6 异步编程

### Promise
* Promise.prototype.then()
* Promise.prototype.catch()
* Promise.all()
* Promise.race()
* Promise.resolve()
* Promise.reject()

### Generator

###### 简单Demo

```javascript
function* helloWorldGenerator() {
yield 'hello'
yield 'world'
return 'ending'
}

var hw = helloWorldGenerator()

console.log(hw.next()) // { value: 'hello', done: false }
console.log(hw.next()) // { value: 'world', done: false }
console.log(hw.next()) // { value: 'ending', done: true }
console.log(hw.next()) // { value: undefined, done: true }
```

###### yield语句

	由于Generator函数返回的遍历器对象，只有调用next方法才会遍历下一个内部状态，所以其实提供了一种可以暂停执行的函数。yield语句就是暂停标志。遍历器对象的next方法的运行逻辑如下:
    * 遇到yield语句，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。

    * 下一次调用next方法时，再继续往下执行，直到遇到下一个yield语句。

    * 如果没有再遇到新的yield语句，就一直运行到函数结束，直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值。

    * 如果该函数没有return语句，则返回的对象的value属性值为undefined。

###### next方法的参数
```javascript
function* f() {
	for (var i = 0; true; i++) {
		var reset = yield i
		if (reset) {
			i = -1
		}
	}
}

var g = f()

console.log(g.next()) // { value: 0, done: false }
console.log(g.next()) // { value: 1, done: false }
console.log(g.next(true)) // { value: 0, done: false }
```
第一次调用next时，程序运行至yield处停止，返回i的值(0)
第二次调用next时，程序运行至yield处，返回i的值(1)
第三次调用next时，yield赋值为true >> reset= true >> i = -1 + 1， 返回i的值(0)

```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var it = foo(5);

console.log(it.next()) // { value:6, done:false }
console.log(it.next(12)) // var y = 2 * 12 -> y / 3 - > { value:8, done:false }
console.log(it.next(13)) // var z = 13 -> x + y + z = 5 + 24 + 13 -> { value:42, done:true }
```

### Thunk

### CO
###### Examples

```javascript
var co = require('co')

co(function*() {
    // resolve multiple promises in parallel
    var a = yield Promise.resolve(1)
    var b = yield Promise.resolve(2)
    var c = yield Promise.resolve(3)
    var res = [a, b, c]
    console.log(res) // => [1, 2, 3]
}).catch(onerror)

function onerror(err) {
    console.error(err.stack)
}
```

简单实现原理
```javascript
var co = function(gen) {
	return new Promise(function(resolve, reject) {
		gen = gen()

		onFulfilled()

		function onFulfilled(res) {
			next(gen.next(res))
		}

		function onRejected(err) {
			next(gen.throw(err))
		}

		function next(ret) {
			if (ret.done) {
				return resolve(ret.value)
			} else {
				ret.value.then(onFulfilled, onRejected)
			}
		}
	})
}
```

### 引用

> [Generator 函数](http://es6.ruanyifeng.com/#docs/generator)

> [TJ Holowaychuk的CO库](https://github.com/tj/co)
