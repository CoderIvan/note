# Routing

在前面的教程，我们创建了一个简单的日志系统，能够广播日志信息给多个`receiver`。

在这个教程，我们将给它添加新的功能。我们使它能够只接收部分的信息。例如，我们可以只转发严重的错误信息到日志文件（为了节省磁盘空间），同时仍然可以打印所有日志信息到终端。

## Bindings
在前面的例子中，我们已经创建了`binding`。你可能记得代码是这样的：
```javascript
ch.bindQueue(q.queue, ex, '')
```
`binding`用来表达`exchange`和`queue`之间关系。可以简单的理解为，这个`queue`对这个`exchange`内的`message`感兴趣

`binding`可以携带额外的参数（上面的空字符串）。这是我们如何带着`key`创建一个`binding`：
```javascript
ch.bindQueue(queue_name, exchange_name, 'black')
```
`binding key`的意义取决于`exchange`的类型。我们前面所使用`fanout exchange`，会完全忽略这个值。

## Direct exchange
我们前面的教程中，我们的日志系统广播信息给所有`consumers`。我们希望能扩展它，使它可以根据信息的严重程度过滤`message`。例如，我们可能希望作为日志信息写入磁盘的脚本只接收严重错误的信息日志，而不是浪费磁盘空间在警告或信息日志消息上。

我正在使用的`fanout exchange`，并不能给我们带来更多的灵活性，它只有盲目的广播能力。

我们将使用`direct exchange`来替代。`direct exchange`的路由选择法非常简单，信息将会发到一个`binding key`正好匹配`message`的`routing key`的`queue`中。

为了说明这一点，请思考下面的配置：

![ALT TEXT](./direct-exchange.png)

在这个配置上，我们能够看到有两个queue绑定在这个`direct exchange`（X）上。第一个`queue`使用`binding key`orange，而第二个`queue`使用两个`binding`，一个`binding key`为black，另一个为green。

在这样的配置中，带着`routing key`orange发布到`exchange`的`message`将路由至`queue`Q1。带着`routing key`black或green发布到`exchange`的`message`将路由至`queue`Q2。其它的被抛掉。

## Multiple bindings

![ALT TEXT](./direct-exchange-multiple.png)

多个`queue`使用同一个`binding key`是完全允许的。在我们的例子中，我们能够使用`binding key`black在X与Q1间添加一个`binding`。在这种情况下，`direct exchange`将为表现出`fanout`相似的情况，即广播`message`到所有匹配的`queue`。带有`routing key`black的`message`将会分发到Q1和Q2中。

## Emitting logs
我们将在我们的信息系统中使用这个模式。替代`fanout`，我们将`message`发送到`direct exchange`中。我们将把日志严重性当做`routing key`。这样，接收脚本将可以根据严重性选择他们想要接收的日志。首先让我们关注发送日志。

一如既往，我们首先需要创建`exchange`：
```javascript
var ex = 'direct_logs'
ch.assertExchange(ex, 'direct', {durable: false})
```
然后我们准备发送`message`：
```javascript
var ex = 'direct_logs'
ch.assertExchange(ex, 'direct', {durable: false})
ch.publish(ex, severity, new Buffer(msg))
```
为了简化工作，我们假定"严重性"为"info"，"warning"，"error"中的一个。

## Subscribing
接收`message`的就像之前教程中的一样工作，除了一个例外：我们将对我们感兴趣的每个"严重性"创建新的`binding`
```javascript
args.forEach(function(severity) {
  ch.bindQueue(q.queue, ex, severity);
})
```

## Putting it all together
![ALT TEXT](./python-four.png)
这是`emit_log_direct.js `的代码
```javascirpt
var amqp = require('amqplib')

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		var ex = 'direct_logs'
		var args = process.argv.slice(2)
		var msg = args.slice(1).join(' ') || 'Hello World!'
		var severity = (args.length > 0) ? args[0] : 'info'

		ch.assertExchange(ex, 'direct', {
			durable: false
		})
		ch.publish(ex, severity, new Buffer(msg))
		console.log(' [x] Sent %s: \'%s\'', severity, msg)
		setTimeout(function() {
			conn.close()
		}, 500)
	})

}).catch(function(err) {
	console.error(err.stack || err)
})
```
这是`receive_logs_direct.js`的代码
```javascript
var amqp = require('amqplib')

var args = process.argv.slice(2)

if (args.length === 0) {
	console.log('Usage: receive_logs_direct.js [info] [warning] [error]')
	process.exit(1)
}

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel()
}).then(function(ch) {
	var ex = 'direct_logs'

	ch.assertExchange(ex, 'direct', {
		durable: false
	})

	return ch.assertQueue('', {
		exclusive: true
	}).then(function(q) {
		console.log(' [*] Waiting for logs. To exit press CTRL+C')

		args.forEach(function(severity) {
			ch.bindQueue(q.queue, ex, severity)
		})

		ch.consume(q.queue, function(msg) {
			console.log(' [x] %s: \'%s\'', msg.fields.routingKey, msg.content.toString())
		}, {
			noAck: true
		})
	})
}).catch(function(err) {
	console.error(err.stack || err)
})

```
如果你只想保存'warning'和'error'（即不包括'info'）的日志信息，只需打开终端并输入：
```bash
node receive_logs_direct.js warning error > logs_from_rabbit.log
```
如果你想在屏幕上看到你所有的日志信息，你可以打开新的终端并这样做：
```bash
node receive_logs_direct.js info warning error
```
还有，例如，去打印error日志信息，只要输入：
```bash
node emit_log_direct.js error "Run. Run. Or it will explode."
 [x] Sent 'error':'Run. Run. Or it will explode.'
```
