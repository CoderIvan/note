# Work Queues

![ALT TEXT](./python-two.png)

在第一门课程，我们写了一段程序，来对指定的`queue`发送和接收信息。而在这门课程中，我们将创建一个`Work Queue`对多个`workers`分发耗时的任务。

`Work Queues`(又称为`Task Queues`)背后的中心思想就是，避免直接运行一个不得不等待它完成的耗资源的任务。作为替代，我们计划将任务延后执行。我们把任务封装成`message`，然后发送到`queue`。运行在后台的`worker`将会弹出这些任务，且最终执行这些工作。当你运行多个`worker`时，任务将会在它们之间共享。

这个概念在Web应用中特别有用，因为不可能在一个短周期的HTTP请求中执行复杂的任务。

### Preparation
在前面的教程中，我们发送了一个内容为"Hello World!"的信息。现在我们将发送字符串来代表复杂的任务。我们没有一个像调整图片大小或渲染PDF文件的真实的任务，所以我们使用`setTimeout`方法来假装我们很“忙”。每个`.`都占用一秒钟“工作”。例如，假的任务描述`Hello...`需要工作三秒钟。

我们会稍微修改之前的例子`send.js`的代码，来允许从命令行发送任意消息。这个程序将会给我们的`work queue`安排任务，所以让我们把它命名为`new_task.js`：

```javascript
var msg = process.argv.slice(2).join(' ') || 'Hello World!'
ch.assertQueue(q, {
    durable: true
})
ch.sendToQueue(q, new Buffer(msg), {
    persistent: true
})
console.log(' [x] Sent \'%s\'', msg)
```

我们之前的`receive.js`脚本也需要改动一下：对`message`中每个`.`都要假装花费1秒工作时间。它将会从`queue`中弹出多个`message`并执行这些任务，所以让我们把它命名为`workder.js`：

```javascript
ch.consume(q, function(msg) {
    var secs = msg.content.toString().split('.').length - 1
    console.log(' [x] Received %s', msg.content.toString())
    setTimeout(function() {
        console.log(' [x] Done')
        ch.ack(msg)
    }, secs * 1000)
}, {
    noAck: false
})
```

注意我们伪造的任务模拟执行时间。
像第一教程中一样运行它：
```bash
node worker.js
node new_task.js
```

### Round-robin dispatching
使用`Task Queue`的一个好处就是能够轻松的进行并行任务。如果出现积压的任务，我们只需添加更多的`worker`，这样更易于扩展。

首先，让我们尝试同时运行两个`workder.js`脚本。他们都从同一个`queue`中获取`message`。但究竟会怎样？让我们看看：

你需要打开三个`console`。两个运行`worker.js`脚本。这些`consoles`就是我们的`consumers`- C1和C2。
```javascript
node worker.js
[*] Waiting for messages. To exit press CTRL+C
```
```javascript
node worker.js
[*] Waiting for messages. To exit press CTRL+C
```

在第三个，我们将用来发布新任务。当你已经启动了`consumer`，你可以发布一些`message`：
```javascript
node new_task.js First message.
node new_task.js Second message..
node new_task.js Third message...
node new_task.js Fourth message....
node new_task.js Fifth message.....
```
让我们看看有哪些被分发到我们的`workers`中：
```javascript
node worker.js
[*] Waiting for messages. To exit press CTRL+C
[x] Received 'First message.'
[x] Received 'Third message...'
[x] Received 'Fifth message.....'
```
```javascript
node worker.js
[*] Waiting for messages. To exit press CTRL+C
[x] Received 'Second message..'
[x] Received 'Fourth message....'
```
默认情况下，RabbitMQ将按顺序发送每个消息到下一个消费者。每个`consumer`将会平均接收到相同数目的`message`。这种`message`的分发方式称为`round-robin`。可以试试三个或更多`worker`。

### Message acknowledgment
做一个任务可能需要几秒钟。你可能想知道如果一个消费者开始漫长的任务，并且部分完成时异常退出会发生什么。在我们当前的代码中，当RabbitMQ分发`message`给`customer`时，它马上会将这个`message`从内存中移除。既然这样，如果我们干掉一个`worker`，我们将会丢失它正在处理的`message`。同样，我们将丢失所有分发给特定`worker`的`message`，而这些`message`并没有被处理过。

但我们并不希望丢失任何任务。如果`worker`异常退出，我们希望这个任务会被分发到其它的`worker`。

为了确保不丢失`message`。RabbitMQ支持`message` `acknowledgments`。`ack`，由`consumer`返回并告诉RabbitMQ特定`meesage`已经被接收并处理完成，这样RabbitMQ就可以安全的删除它。

如果一个`consumer`没有发送`ack`就异常退出了，RabbitMQ会知道这些`message`没有完全处理，这样就会分发到另一个`consumer`。通过这种方式，你就可以确保即使`worker`偶然异常退出也不会丢失任何`message`。

这里没有任何`message`超时设置；RabbitMQ只会在`worker`异常退出时分发`message`，尽管这是一个非常非常漫长的任务。

```javascript
ch.consume(q, function(msg) {
    var secs = msg.content.toString().split('.').length - 1

    console.log(' [x] Received %s', msg.content.toString())
    setTimeout(function() {
        console.log(' [x] Done')
        ch.ack(msg)
    }, secs * 1000)
}, {
    noAck: false
})
```
使用这个代码我们可以确保即使你使用`CTRL + C`强制关闭正在处理`message`的`worker`，也将不会丢失任何`message`。在`worker`异常退出的时候，没发送`ack`的所有`message`将马上被重新分发。

```language
Forgotten acknowledgment

忘记发送ack是一个普遍的失误。一个简单的失误，但带来严重的后果。message将会重新分发，当你的client退出(这可能看起来像是会随机分发)，但实际RabbitMQ将会占用越来越多的内存，因为它并不能释放unack的信息。

为了能调试这个类型的错误，你可以使用`rabbitmq`来打印`message_unacknowledeged`字段：
```
```bash
sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
Listing queues ...
hello    0       0
...done.
```

### Message durability
我们已经学习了怎样确保即使`consumer`异常退出，`message`也不会丢失。但我们的任务还是会丢失，当RabbitMQ服务关闭。

当RabbitMQ退出或崩溃时，它将会丢失所有`queue`和`message`，除非你告诉它不要这样做。为确保`message`不会丢失，我们需要两个东西：我们需要把`queue`和`message`都标记为`durable`

```javascript
ch.assertQueue('hello', {durable: true})
```

尽管这个命令本身是正确的，但它不能运行在我们当前的环境。因为我们已经定义了一个命名为`hello`的非`durable`的`queue`。RabbitMQ不允许你用不同的参数重复定义一个存在的`queue`，这将会返回一个错误给所有尝试这么做的程序。但有一个快速解决方案，让我们声明一个不同名字的`queue`，例如`task_queue`：
```javascript
ch.assertQueue('task_queue', {durable: true})
```
这`durable`选项的修改，需要同时应用到`producer`和`consumer`的代码中。

此时，我们就能确保`task_queue`不会丢失，即使RabbitMQ重启。现在我们需要标记我们的`message`为`persistent`，通过在`Channel.sendToQueue`中使用`persistent`选项。
```javascript
ch.sendToQueue(q, new Buffer(msg), {persistent: true})
```
```language
将`message`标记为`persistent`并不能完全保证信息不会丢失。尽管它告诉RabbitMQ保存到磁盘，这里仍然有一个短的时间周期，即RabbitMQ接收到`message`但并没保存它。同样，RabbitMQ不会给所有`message`做同步——它可能只是保存到缓存中而不是真正的写到磁盘。这持久化保证并不强壮，但已经足够应用于我们简单的`task queue`了。如果你需要一个强壮的保证，你可以使用`publisher confirms`
```

### Fair dispatch
您可能已经注意到,这样的分发方式可能仍然没有完全按照我们想要的工作。例如：在有两个`worker`的情况下，当所有奇数`message`比较重而所有偶数`message`比较轻时，这样一个`worker`就几乎一直在工作，而另一个`worker`就比较空闲。而RabbitMQ并不知道这种情况，继续均匀的分发这些`message`。

这是由于RabbitMQ仅仅分发进入`queue`的`message`。它并不观察consumer的`unacknowledged`的`message`。它只是盲目地分派每第n个`message`至第n个`consumer`

![ALT TEXT](./prefetch-count.png)

为了解决这个问题，我们可以设置prefetch的值为1。这告诉RabbitMQ不要同时给`worker`多于1条`message`。或者换一种说法，不要分发新的`message`给`worker`，直到处理完并`acknowledged`前一条`message`。作为代替，它将分发它给另一个不忙的`worker`。
```javascript
ch.prefetch(1)
```
```language
Note about queue size

如果所有的worker都在忙，你的queue将会满载。你要注意这些，或许增加更多的worker，或许使用其它方案
```

### Putting it all together
最终我们的`new_task.js`代码：
```javascript
var amqp = require('amqplib/channel_api')

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		var q = 'task_queue'

		var msg = process.argv.slice(2).join(' ') || 'Hello World!'

		ch.assertQueue(q, {
			durable: true
		})
		ch.sendToQueue(q, new Buffer(msg), {
			persistent: true
		})
		console.log(' [x] Sent \'%s\'', msg)

		setTimeout(function() {
			conn.close()
		}, 500)
	})
})
```
和我们的`worker.js`代码：
```javascript
var amqp = require('amqplib/channel_api')

amqp.connect('amqp://localhost').then(function(conn) {
	return conn.createChannel().then(function(ch) {
		var q = 'task_queue'
		ch.assertQueue(q, {
			durable: true
		})

		console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q)
		ch.consume(q, function(msg) {
			var secs = msg.content.toString().split('.').length - 1

			console.log(' [x] Received %s', msg.content.toString())
			setTimeout(function() {
				console.log(' [x] Done')
				ch.ack(msg)
			}, secs * 1000)
		}, {
			noAck: false
		})
	})
})
```

使用`message` `acknowledgments`和`prefetch`，你能装配一个`work queue`。`durability`参数将使任务在RabbitMQ重启后，保留下来。
