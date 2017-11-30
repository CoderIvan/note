## Common_Gateway

#### 需求
* Consuming与Producing能够轻易集群
* 对于Producing的每个请求都能处理完成后能作出响应

#### 解决方案
* 使用RPC模式

#### 问题
* 如果不存在Consuming，Producing会有什么行为。
 * Producing一直等待响应，可以使用`expiration`参数，但Producing并不知道message是超时还是被处理。Common_Gateway可以自行做超时处理。

* Producing与Consuming是否能够容易扩展成集群

* 注意合理设置channel的prefetch，如果过小并发性能将受到影响，过大容易导致负载不均衡。

* 性能。处理每个请求需要0.2ms。并发性能与之前的实现相当，但据网上的一些测试，可能高并发时响应时间会稍长。