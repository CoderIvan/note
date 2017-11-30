# Publish/Subscribe

在前面的教程，我们创建了一个`work queue`，假定每个任务都刚好分发给一个`worker`。在这教程里我将做完全不一样的事情，我们将分发`message`给多个`consumer`。这种模式称为`publish/subscribe`。

为了举例说明这个模式，我们将建立一个简单的日志系统。它将包含两个程序，第一个用于发送日志信息，第二个用于接收并打印它们。

在我们的日志系统中，每个运行接收程序的副本都将收到`message`。使用这种方式，我们可以运行一个接收者来保存日志，同时运行另一个接收者打印日志到屏幕。

本质上，发布的日志消息将被广播到所有的接收器。

## Exchanges

在前面的教程，我们从一个`queue`中发送和接收信息。现在是时候介绍完整的RabbitMQ的信息模型了。

让我们快速回顾之前的教程：
> `producer` 发送信息的用户应用程序
> `queue` 保存信息的缓存区
> `consumer` 接收信息的用户应用程序

RabbitMQ信息模型的核心理念是，`producer`从不直接发送`message`到`queue`。实际上，`producer`完全不知道`message`是否会被分发到`queue`。

作为代替，`producer`只能把`message`发送给`exchange`。`exchange`是一个非常简单的东西，一端它接收从`producer`发来的信息，另一端它推送这些信息给`queue`。`exchange`能正确的知道当它收到`message`应该做什么。是把它添加到特定的`queue`中？还是添加到多个`queue`中？又或者是抛掉？。这个规则由`exchange type`来定义。
![ALT TEXT](./exchanges.png)

这里有几个`exchange type`可以使用：`direct`, `topic`, `headers`和`fanout`。我们将使用最后一个`fanout`。让我们创建这个类型的`exchange`，并命名为`logs`：
```javascript
ch.assertExchange('logs', 'fanout', {durable: false})
```
这个`fanout exchange`非常简单。可能你已经从名字上猜到，它只是广播所有它接收到的信息给所有它所知道的`queue`。这恰好是我们的日志系统所需要的。

#### Listing exchanges
想列出服务器上的`exchange`，你可以使用rabbitmqctl：
```bash
$ sudo rabbitmqctl list_exchanges
Listing exchanges ...
        direct
amq.direct      direct
amq.fanout      fanout
amq.headers     headers
amq.match       headers
amq.rabbitmq.log        topic
amq.rabbitmq.trace      topic
amq.topic       topic
logs    fanout
...done.
```

#### Nameless exchange
在前面的教程，我们并不知道任何有关于`exchange`的东西，但仍然可以发送`message`给`queue`。可以这么做是因为我们使用默认的`exchange`，一个使用空字符串("")定义的`exchange`。

回忆一下，我们之前是怎样发布`message`给`queue`的：
```javascript
ch.sendToQueue('hello', new Buffer('Hello World!'))
```
这里我们使用默认的、或者说匿名的`exchange`：`message`被路由到第一个参数所指定的`queue`中（如果它存在）。

现在，我们可以发布信息到`exchange`，使用这来代替：
```javascript
ch.publish('logs', '', new Buffer('Hello World!'))
```
第二个参数为空字符串的意思是，我们不想发送`message`到任何指定的`queue`。我们只想发布信息到我们的'logs'`exchange`。

## Temporary queues
你可能还刻我们之前使用指定名字的`queue`(记得`hello`和`task_queue`吗？)。命名一个`queue`对我们非常重要，因为我们需要指定`worker`使用同一个`queue`。给`queue`命名是非常重要的，当我们希望把这个`queue`在`producer`和`consumer`之间共享。

但这不是我们日志系统的方案。我们想要监听到所有的日志消息，而不仅仅是其中的一个子集。我们也只对当前流动的`message`感兴趣而不是旧的`message`。为了解决这个问题，我们需要做两件事情。

首先，无论我们什么时候连接到Rabbit，我们都需要一个全新的、空的`queue`。为了这样做，我们需要创建一个随机名字的`queue`，或者更好的方法是让`Server`选择一个随机名字给我们。

再者，当我们断开`consumer`，`queue`应该被自动删除。

在`amqp.node`客户端中，当我们提供空字符串作为`queue`的名字，我们将会创建一个`non-durable`的`queue`，这个`queue`带着被生成的名字：
```javascript
ch.assertQueue('', {exclusive: true})
```
当这个方法返回，`queue`的实例包含一个由RabbitMQ生成的随机`queue`名字。例如，像是这样的`amq.gen-JzTY20BRgKO-HjmUJj0wLg`。

当显式的关闭连接，`queue`将会被删除，因为它被显式声明为`exclusive`。

## Bindings

![ALT TEXT](./bindings.png)

我们已经创建了一个`fanout exchange`和一个`queue`。现在我们需要告诉`exchange`发送`message`给我们的`queue`。这种`exchange`和`queue`的关系称为`binding`。
```javascript
ch.bindQueue(queue_name, 'logs', '')
```
现在开始，logs上的`exchange`将会发送`message`给我们的`queue`。

#### Listing bindings
你可以列出正在使用的`binding`，可能与你猜的一样，使用`rabbitmqctl list_bindings`。

## Putting it all together

![ALT TEXT](./python-three-overall.png)

发送日志信息的`producer`程序和之前教程的并没有太大变化。最重要的不同是我们现在希望发布`meesage`给我们的命名为logs的`exchange`，而不是匿名的`exchange`。当我们发送的时候，我需要提供一个`routing key`，但这个值会被`fanout exchange`忽略。这里是`emit_log.js`脚本的代码：
```javascript
var amqp = require('amqplib/channel_api')

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		var ex = 'logs'
		var msg = process.argv.slice(2).join(' ') || 'Hello World!'

		ch.assertExchange(ex, 'fanout', {
			durable: false
		})
		ch.publish(ex, '', new Buffer(msg))
		console.log(' [x] Sent %s', msg)
	})

	setTimeout(function() {
		conn.close()
	}, 500)
}).catch(function(err) {
	console.error(err.stack || err)
})
```
和我们所看到的一样，连接建立完成后，我们声明了一个`exchange`。这一步是必需的，因为发布信息到一个不存在的`exchange`是被禁止的。

`message`将会抛弃，当还没有任何一个`queue`绑定到`exchange`的时候，但这对我们来说是允许的；如果还没有任何`consumer`在监听，我们可以安全的抛弃掉这个`message`。

`receive_log.js`的代码：
```javascript
var amqp = require('amqplib/channel_api')

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel()
}).then(function(ch) {
	var ex = 'logs'

	ch.assertExchange(ex, 'fanout', {
		durable: false
	})

	return ch.assertQueue('', {
		exclusive: true
	}).then(function(q) {
		console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q.queue)
		ch.bindQueue(q.queue, ex, '')

		ch.consume(q.queue, function(msg) {
			console.log(' [x] %s', msg.content.toString())
		}, {
			noAck: true
		})
	})
}).catch(function(err) {
	console.error(err.stack || err)
})

```

如果你想保存日志到文件，只需要打开终端并输入：
```bash
node receive_logs.js > logs_from_rabbit.log
```
如果你想在屏幕上显示日志，再打开一个新的终端并输入：
```bash
node receive_logs.js
```
还有当然的是发送日志，输入：
```bash
node emit_log.js
```
使用`rabbitmqctl list_bindings`，你可以证实代码确实如我们希望的创建了`binding`和`queue`。运行两个`receive_logs.js`，你应该会观察到这样的情况：
```bash
$ sudo rabbitmqctl list_bindings
Listing bindings ...
logs    exchange        amq.gen-JzTY20BRgKO-HjmUJj0wLg  queue           []
logs    exchange        amq.gen-vso0PVvyiRIL2WoV3i48Yg  queue           []
...done.
```
结果的解释很简单：logs`exchange`关联两个由服务器命名的`queue`。这恰好是我们所希望的。
