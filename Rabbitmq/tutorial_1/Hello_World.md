# Hello World

### Introduction
RabbitMQ是一个信息中间件。本质上，它接收`procucers`的信息和分发它们给`consumers`。在内部，它能够通过所给的规则对信息进行路由，缓冲和持久化。

RabbitMQ，和消息传递在一般情况下，使用一些术语：

* Producing，即发送者。发送信息的程序称为`producer`。以下图描述:

	![Alt Text](./producer.png)

* A queue，即mailbox的名字。它运行在RabbitMQ内部。尽管信息流通过RabbitMQ与你的应用之间，它们也只能存在于`queue`里面。`queue`没有任何约束，它可以保存任意你希望的信息，它本质上是一个无限的缓冲区。多个`producers`可以发送信息到同一个`queue`，多个`consumers`可以从同一个`queue`中获取信息。以下图描述:

	![Alt Text](./queue.png)

* Consuming，即接收者。几乎在等待接收数据的程序称为`consumer`。以下图描述:

	![Alt Text](./consumer.png)

注意`producer`，`consumer`与`broker`并不需要在同一机器内，而实际上，大部份应用也不会。

### Hello World
在教程的这一部分，我们将用javascript写两个小的程序；一个发送一条信息的`producer`，和一个接收信息且打印它的`consumer`。我们会忽略`amqp.node`API的一些细节，把精力集中在简单的事情上开始。这是一条"Hello World"信息。

在下图，"P"代指`producer`和"C"是我们的`consumer`。中间的长方形是`queue`，一个RabbitMQ用于代替`consuemer`的信息缓冲区：

![Alt Text](./python-one.png)

    The amqp.node client library

    RabbitMQ使用AMQP0.9.1，一个开源，通用的信息协议。对于RabbitMQ有多个[不同语言的实现](http://www.rabbitmq.com/devtools.html)。我们将在本教程中使用`amqp.node`

    首先，使用NPM安装amqp.node

    npm install amqplib


##### Sending

![Alt Text](./sending.png)

我们把信息`sender`命名为`send.js`和把`receiver`命名为`receive.js`。`sender`连接RabbitMQ，发送一条信息，然后退出。

在`send.js`里，我们需要引入库：
```javascript
var amqp = require('amqplib/channel_api')
```
然后连接到RabbitMQ服务器：
```javascript
amqp.connect('amqp://localhost')
```
创建`channel`，几乎所以API使用该对象执行：
```javascript
amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel()
})
```
发送前，我们需要声明需要信息要发送到哪个的`queue`；然后我们把信息发送到这个`queue`上：
```javascript
var amqp = require('amqplib/channel_api')
amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		var q = 'hello'
		ch.assertQueue(q, {
			durable: false
		})
		ch.sendToQueue(q, new Buffer('Hello World!'))
		console.log(' [x] Sent \'Hello World!\'')
	})
})
```
声明一个`queue`等同于，当且仅当`queue`不存在时创建它。信息内容为字节数组，所以你可以使用你喜欢的编码方式。
最后我们关闭`connection`
```javascript
setTimeout(function() { conn.close(); process.exit(0) }, 500);
```

##### Receiving
上面的是我们的`sender`。我们的`receiver`将接受由RabbitMQ推送来的信息。所以不同于发送者只需发布一条消息，我们需要保持运行去监听消息，然后打印它们。

与`send.js`一样，我们引入库：
```javascript
var amqp = require('amqplib/channel_api')
```

与`sender`的设置是一样的；我们打开一个`connection`、一个`channel`和声明一个需要监听的`queue`。注意这里要匹配上`sender`所发送的`queue`。
```javascript
amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		var q = 'hello'
		ch.assertQueue(q, {
			durable: false
		})
	})
})
```
注意这里我们同样也声明一个`queue`。因为我们可能在启动sender之前启动receiver，我们需要在监听之前确定`queue`存在。

我们告诉服务端要从该`queue`上分发消息给我们。由于服务端使用异步的方式推送信息给我们，我们要提供`callback`，用于RabbitMQ推送信息至我们的`consumer`时执行。这就是`Channel.consum`所做的。
```javascript
console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q)
ch.consume(q, function(msg) {
    console.log(' [x] Received %s', msg.content.toString())
}, {
    noAck: true
})
```

##### Putting it all together

如果你想查看生成的`queue`，可以使用`rabbitmqctl list_queues`

** Hello World! **
