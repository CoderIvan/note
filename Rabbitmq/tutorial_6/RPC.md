## Remote procedure call (RPC)

在第二门教程，我们知道如何使用`Queue`分发耗时任务（`time-consuming tasks`）给`server`。

但如果我们需要在一个远程机器上运行一个函数且需要等待结果呢？嗯，这是一个不同的故事了。这种模式一般被称为远程过程调用（`Remote Procedure Call`）或者`RPC`。

在这个教程我们将会使用RabbitMQ去创建一个RPC系统：一个客户端与一个可扩展RPC服务。由于我们没有任何值得分发的耗时任务（`time-consuming tasks`），我们将创建一个假的RPC服务，该服务将返回斐波纳契数列（Fibonacci numbers）。

#### Callback queue
一般而言，RabbitMQ比较容易实现RPC。一个客户端发送一个请求消息，然后服务端返回响应消息。为了接收响应，我们需要发送信息到`callback queue`。我们使用默认的queue。我们马上来试下吧：

```javascript
ch.assertQueue('', {exclusive: true})
ch.sendToQueue('rpc_queue',new Buffer('10'), { replyTo: queue_name })
```


#### Message properties

AMQP协议为消息（`message`）预留了14个参数。除了以下参数，其它大部分参数都很少会用上：

* persistent: 标记消息（`message`）为持久（`persistent`） (值为true) or 短暂（`transient`） (值为false)。 可以回忆第二门教程中对该参数的描述。

* content_type: 用于描述编码方式。例如，经常使用的JSON格式（设置为`application/json`）。

* reply_to: 通常用于指定返回结果的`queue`。

* correlation_id: 帮助关联RPC的响应与请求。

#### Correlation Id
在上述方法中，我们为每个RPC请求都创建了一个`callback queue`。这很低效，但幸运的是有一个更好的办法,就是让我们为每个`Client`创建一个单独`callback queue`

这衍生出一个新问题，就是不知道`callback queue`中的响应属于哪个请求。这时候就需要使用`correlation id`。我们为每个请求设置一个唯一值。然后，当我们在`callback queue`接收到响应时，查看该参数，根据这个参数我们能匹配上请求和响应。如果我们发现未知的`correlation_id`值，我们将安全的抛弃掉这个不属于我们请求的`message`

你可能会问，为什么我们要忽略`callback queue`中未知的`message`，而不是做失败和错误处理？
it's due to a possibility of a race condition on the server side. Although unlikely, it is possible that the RPC server will die just after sending us the answer, but before sending an acknowledgment message for the request. If that happens, the restarted RPC server will process the request again. That's why on the client we must handle the duplicate responses gracefully, and the RPC should ideally be idempotent.

#### Summary

![Alt Text](./python-six.png)

RPC的工作流程：
1. 当`client`启动，创建一个专有的匿名的`callback queue`。
1. 对一个RPC请求，客户端发一个带有两个参数的`message`  :
 * reply_to: 设置结果回调的`callback queue`
 * correlation_id: 为每个请求设置一个唯一值
1. 发送请求至`rpc_queue`队列。
1. RPC worker（亦称：Server）在`rpc_queue`队列上等待请求。当请求出现，处理任务并使用返回结果至`client`指定的`reply_to`的队列中
1. `client`在`callback queue`上等待数据。当消息出现，它将检查`correlation_id`值。如果该值与请求时的值匹配，将返回该值给应用。

#### Putting it all together
斐波纳契数列:
```javascript
function fibonacci(n) {
  if (n == 0 || n == 1)
    return n
  else
    return fibonacci(n - 1) + fibonacci(n - 2)
}
```
我们声明一个斐波纳契数列函数，假定输入的是有效的正整数。（别指望这函数可以运行一个大数值，这可能是最慢的递归实现）

###### RPC Server代码`rpc_server.js`：
```javascript
var amqp = require('amqplib/channel_api')

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel()
}).then(function(ch) {
	var q = 'rpc_queue'
	ch.assertQueue(q, {
		durable: false
	})
	ch.prefetch(1)
	console.log(' [x] Awaiting RPC requests')
	ch.consume(q, function reply(msg) {
		var n = parseInt(msg.content.toString())

		console.log(" [.] fib(%d)", n)

		var r = fibonacci(n)

		ch.sendToQueue(msg.properties.replyTo, new Buffer(r.toString()), {
			correlationId: msg.properties.correlationId
		})

		ch.ack(msg)
	})
}).catch(function(err) {
	console.error(err.stack || err)
})


function fibonacci(n) {
	if (n == 0 || n == 1) {
		return n
	} else {
		return fibonacci(n - 1) + fibonacci(n - 2)
	}
}
```
服务端代码相当简单:
* 像往常一样,我们首先建立`connection`、`channel`和声明`queue`。
* 我们可能想运行一个以上的服务进程。为了使多个服务进程负载均衡，我们需要为`channel`设置`prefetch`值。
* 我们使用`Channel.consume`去消费`queue`中的`message`。然后执行一个回调，该回调处理任务并返回响应。

###### RPC Client代码`rpc_client.js`：
```javascript
var amqp = require('amqplib/channel_api')

var args = process.argv.slice(2)

if (args.length == 0) {
	console.log("Usage: rpc_client.js num")
	return
}

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		ch.assertQueue('', {
			exclusive: true
		}).then(function(q) {
			var corr = generateUuid()
			var num = parseInt(args[0])

			console.log(' [x] Requesting fib(%d)', num)

			ch.consume(q.queue, function(msg) {
				if (msg.properties.correlationId == corr) {
					console.log(' [.] Got %s', msg.content.toString())
					conn.close()
				}
			}, {
				noAck: true
			})

			ch.sendToQueue('rpc_queue', new Buffer(num.toString()), {
				correlationId: corr,
				replyTo: q.queue
			})
		})
	})
}).catch(function(err) {
	console.error(err.stack || err)
})

function generateUuid() {
	return Math.random().toString() +
		Math.random().toString() +
		Math.random().toString();
}
```

现在是一个很好的时间来看看我们完整的示例源代码`rpc_client.js`和`rpc_server.js`。
我们的RPC服务已经准备好了。我们启动server：
```bash
node rpc_server.js
[x] Awaiting RPC requests
```
运行client，请求获取斐波纳契值：
```bash
node rpc_client.js
[x] Requesting fib(30)
```

本文提供的设计并不是唯一可能的RPC服务实现，但是它有一些重要优势：
*  如果RPC server非常慢，可以使用集群的方式解决。
* 对于client端，RPC需要发送和接收的只一个`message`。由于RPC客户端对于一个RPC请求只需要一个网络往返。

我们的代码仍然是相当简单的,不尝试解决更复杂的(但重要的)问题，例如：
* 当没有服务器运行，客户端应该如何处理?
* 客户端应该有某种RPC超时吗?
* 如果服务器故障和抛出了一个异常,它应该转发给客户端吗？
* 处理前，防止无效传入的消息(如检查范围,类型)。
