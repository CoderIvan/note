# Topics
在上一个教程我们完善了我们的日志系统。替换只有伪广播的`fanout exchange`，使用了`direct exchange`，并获得了选择性接收日志的可能。

尽管使用`direct exchange`完善了我们的系统，但它还是有限制。就是并不能基于多种条件路由。

在我们的日志系统中，我们可能不但想根据日志的严重程度订阅，也希望根据发送日志的来源订阅。你可能通过Unix tool `syslog`知道这个概念，它根据严重程度和来源设备进行路由。

这将给我们一个很大的灵活性，我们可能只想监听来自'cron'的严重日志和来自'kern'的所有日志。

要在我们的日志系统实现这个，我们需要更多了解更加复杂的`topic exchange`。

## Topic exchange
发送到`topic exchange`的`message`不能携带随意的`routing_key`，它必需是由逗号分隔的单词数组。单词可以是任意的，但一般是指代与`message`有关的某种特点。一些有效的`routing key`例子：`stock.usd.nyse`，`nyse.vmw`，`quick.orange.rabbit`。可以根据你的喜好在`routing key`中使用多个单词，上限为255字节。

`binding key`也必需是一样的形式。`topic exchange`背后的逻辑与`direct exchange`类似，一个带有特定`routing key`发送的`message`将会被分发至所有匹配上`binding key`的`queue`中。然而对于`binding key`有两个重要的特殊情况：
> "*" (star) 可以完全代替一个单词
> "#" (hash) 可以完全代替0个或以上的单词

使用一个例子，能更好的解释：

![ALT TEXT](./python-five.png)

在这个例子中，我们将发送都是用于描述动物的`message`。`message`将携带包含3个单词的`routing key`发送。`routing key`的第1个单词描述速度，第2个单词描述颜色，第3个单词为特种：`<speed>.<colour>.<species>`。

我们创建3个binding：Q1使用`binding key``*.orange.*`绑定，Q2使用`*.*.rabbit`和`lazy.#`。

这些`binding`可以概括为：
> Q1对所有orange颜色的动物感兴趣。
> Q2希望监听所有有关rabbit的信息，和所有lazy的动物。

一条`routing key`为`quick.orange.rabbit`的信息将发送到所有的`queue`中，`lazy.orange.elephant`也是同样。另一方面`quick.orange.fox`将只分发到第一个`queue`，和`lazy.brown.fox`将只分发到第二个。`lazy.pink.rabbit`将只分发一次到第二个`queue`中，尽管它匹配上了两个`binding`。`quick.brown.fox`没有匹配上任何`binding`，所以抛掉它。

如果我们打破规则，只使用1个或4个单词来发送信息，会发生什么？像`orange`或`quick.orange.male.rabbit`？好吧，这些`message`将会由于没匹配上任何`binding`而丢失。

在另一方面`lazy.orange.male.rabbit`，尽管它有4个单词，也会匹配最后一个`binding`然后发送到第2个`queue`中。

#### Topic exchange
`topic exchange`功能是强大的，可以表现得像其它`exchange`一样。

当`queue`绑定"#"作为`binding key`，它将会不管`routing key`接收所有`message`，像`fanout exchange`那样。

如果在`binding`中，不使用"*"和"#"，这个`topic exchange`将像`direct exchange`那样。

## Putting it all together
我们将会在我们的日志系统中使用`topic exchange`。We'll start off with a working assumption that the routing keys of logs will have two words: "<facility>.<severity>".

这里代码几乎与前面的教程一致。

`emit_log_topic.js`的代码：
```javascript
	// TODO
```
`recevie_logs_topic.js`的代码：
```javascript
	// TODO
```

接收所有日志：
```bash
node receive_logs_topic.js "#"
```
从"kern"设备中接收所有日志：
```bash
node receive_logs_topic.js "kern.*"
```
只想监听有关"critical"的日志：
```bash
node receive_logs_topic.js "*.critical"
```
你能够创建多个`binding`：
```bash
node receive_logs_topic.js "kern.*" "*.critical"
```
不家使用`routing key``kern.critical`发送日志，输入：
```bash
node emit_log_topic.js "kern.critical" "A critical kernel error"
```

Have fun playing with these programs. Note that the code doesn't make any assumption about the routing or binding keys, you may want to play with more than two routing key parameters。

某些难题：
> "*"是否能匹配上带有空的`routing key`的`message`？
> "#.*"是否能匹配上字符串".."处为`key`的`message`？能匹配上单个单词的`message`吗？
> "a.*.#"与"a.#"是否有什么不用？
