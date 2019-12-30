# ZooKeeper

## 什么是ZooKeeper？ ZooKeeper有什么用？

ZooKeeper是`为分布式应用提供协调服`务的`分布式`的`开源`的应用。它公开了一组简单的原语，以便分布式应用程序可以基于这些原语实现更高级别的服务，用于`同步`、`配置维护`、`分组服务`和`命名服务`。它被设计为易于编程，并使用了一种数据模型，其风格类似于文件系统的目录树结构。它运行在Java中，并具有Java和C的绑定。

协调服务是出了名的难搞。它们特别容易出现竞争条件和死锁等错误。ZooKeeper背后的动机是为了减轻分布式应用程序从头实现协调服务的责任。

## 设计目标

### 简单

ZooKeeper允许`分布式进程`通过`共享的层级命名空间`来相互协调，该命名空间的组织类似于标准文件系统。name space由data registers组成，用ZooKeeper的说法称为znodes，它们类似于文件和目录。与典型的为了存储而设计的文件系统不同，ZooKeeper数据保存在内存中，这意味着ZooKeeper可以实现高吞吐量和低延迟。

ZooKeeper的实现非常重视高性能、高可用性和严格有序的访问，ZooKeeper的性能方面意味着它可以用于大型分布式系统。可靠性方面使它不会成为单点故障。严格有序意味着可以在客户端实现复杂的同步原语。

### 自我复制
与它所协调的分布式进程一样，ZooKeeper本身也打算在一组称为集合的主机上进行复制。
![此处输入图片的描述][1]
组成ZooKeeper服务的服务器必须相互知道对方的存在。它们在内存中维护状态映像，以及持久存储中的事务日志和快照。只要大多数服务器可用，ZooKeeper服务就可用。
客户端连接到单个ZooKeeper服务器。客户端维护一个TCP连接，通过它发送请求、获取响应、获取监视事件和发送心跳。如果到服务器的TCP连接中断，客户机将连接到另一台服务器。

### 有序
ZooKeeper用一个数字来标记每个更新，这个数字反映了所有ZooKeeper事务的顺序。后续操作可以使用该顺序实现更高级别的抽象，比如同步原语。

### 快速
在“以读取为主”的工作负载中，它的速度特别快。ZooKeeper应用程序运行在数千台机器上，当读操作比写操作更常见时，它的性能最好，比率约为10:1。

## 数据模型和层次命名空间
ZooKeeper提供的名称空间非常类似于标准的文件系统。名称是由斜杠(/)分隔的路径元素序列。ZooKeeper名称空间中的每个节点都由一个路径标识。

ZooKeeper's Hierarchical Namespace
![ZooKeeper's Hierarchical Namespace][2]

## 节点与临时节点
与标准的文件系统不同，ZooKeeperr的名称空间中的每个节点都可以拥有与其关联的数据和子节点。这就像一个文件系统允许一个文件同时也是一个目录。(ZooKeeper用来存储协调数据:状态信息，配置，位置信息等，因此，存储在每个节点上的数据通常很小，以字节到千字节为单位)。我们使用术语znode来表明我们在讨论ZooKeeper的数据节点。

Znodes维护一个状态结构，其中包含数据更改、ACL更改和时间戳的版本号，以允许缓存验证和协调更新。每当znode的数据发生变化，版本号就会增加。例如，每当客户机检索数据时，它也接收数据的版本。

在命名空间中的每个znode的存储的数据，读与写都是原子的。读取将获取与znode关联的所有数据字节，而写将替换所有数据。每个节点都有一个访问控制列表(ACL)，用于限制谁可以做什么。

ZooKeeper也有临时节点的概念。：只要创建znode的会话处于活动状态，这些znode就一直存在。当会话结束时，将删除znode。

## 条件更新和观察
ZooKeeper支持监控的概念。客户端允许在znode上设置监控。当znode变更时，监控将会被触发并删除。当监控被触发，客户端会接收到通知znode变更的消息包。如果客户机和ZooKeeper服务器之间的连接中断，客户机将收到一个本地通知。

## 保证
ZooKeeper非常快，也非常简单。但是，由于它的目标是作为构建更复杂的服务(如同步)的基础，所以它提供了一系列保证。这些是

* Sequential Consistency - 来自客户机的更新将按照它们被发送的顺序来执行。
* Atomicity - 更新只有成功与失败。没有部分结果。
* Single System Image - 客户端将看到相同的服务视图，不管它连的是哪个服务器。
* Reliability - 一定更新被执行，它将一直持续到客户端覆盖更新为止。
* Timeliness - 保证系统的客户端视图在一定的时间范围内是最新的。

## 简易API
ZooKeeper的设计目标之一是提供一个非常简单的编程接口。因此，它只支持这些操作：

* create
* delete
* exists
* get data
* set data
* get children
* sync: 等待传播数据

## 实现
![此处输入图片的描述][3]

复制的数据库是一个包含整个数据树的内存数据库。更新被记录到磁盘上以获得可恢复性，写操作在应用到内存数据库之前被序列化到磁盘上。

每个ZooKeeper服务器服务客户端。客户端仅连接到一个服务器来提交请求。读请求从每个服务器数据库的本地副本获得服务。更改服务状态的请求、写请求由一致性协议处理。

作为一致性协议的一部分，所有来自客户端的写请求都被转发到一个名为leader的服务器上。ZooKeeper服务器的其余部分(称为follower)接收来自leader的消息建议，并就消息传递达成一致。消息层负责在出现故障时替换领导者，并将追随者与领导者同步。

ZooKeeper使用自定义原子消息传递协议。因为消息层是原子的，所以ZooKeeper可以保证本地副本不会发散。当leader收到一个写请求时，它会计算将要应用的写时系统的状态，并将其转换为捕获这个新状态的事务。

### Standalone mode
`onf/zoo.cfg:`
```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
```
```bash
bin/zkServer.sh start
```
* tickTime : the basic time unit in milliseconds used by ZooKeeper. It is used to do heartbeats and the minimum session timeout will be twice the tickTime.

* dataDir : the location to store the in-memory database snapshots and, unless specified otherwise, the transaction log of updates to the database.

* clientPort : the port to listen for client connections

### Replicated mode
`onf/zoo.cfg:`
```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
server.1=zoo1:2888:3888
server.2=zoo2:2888:3888
server.3=zoo3:2888:3888
```
```bash
bin/zkServer.sh start
```
* initLimit : is timeouts ZooKeeper uses to limit the length of time the ZooKeeper servers in quorum have to connect to a leader.
* syncLimit : limits how far out of date a server can be from a leader.
* server.X list the servers that make up the ZooKeeper service.

### Docker
```yml
version: '3.1'

services:
  zoo1:
    image: zookeeper
    restart: always
    hostname: zoo1
    ports:
      - 2181:2181
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=0.0.0.0:2888:3888;2181 server.2=zoo2:2888:3888;2181 server.3=zoo3:2888:3888;2181

  zoo2:
    image: zookeeper
    restart: always
    hostname: zoo2
    ports:
      - 2182:2181
    environment:
      ZOO_MY_ID: 2
      ZOO_SERVERS: server.1=zoo1:2888:3888;2181 server.2=0.0.0.0:2888:3888;2181 server.3=zoo3:2888:3888;2181

  zoo3:
    image: zookeeper
    restart: always
    hostname: zoo3
    ports:
      - 2183:2181
    environment:
      ZOO_MY_ID: 3
      ZOO_SERVERS: server.1=zoo1:2888:3888;2181 server.2=zoo2:2888:3888;2181 server.3=0.0.0.0:2888:3888;2181
```

# Command
![1576590744(1)](https://user-images.githubusercontent.com/7960859/71001125-8ce4f100-2117-11ea-9331-d000c58d56c6.jpg)

# Out of the Box Applications

## Name Service
```bash
create /ivan
create /ivan/name hello
get /ivan/name
ls /ivan/providers
```

## Configuration
```bash
create /ivan
create /ivan/config version=1
get -w /ivan/config
```
```bash
set /ivan/config version=2
```

## Group Membership
* The group is represented by a node. 
* Members of the group create ephemeral nodes under the group node. 
* Nodes of the members that fail abnormally will be removed automatically when ZooKeeper detects the failure.
```bash
create /ivan
create /ivan/group
ls -w  /ivan/group
```
```bash
create -s -e /ivan/group/
```

# 引用
> [官网](http://zookeeper.apache.org/doc/current/index.html)
> [Zookeeper系列（6）-- Zookeeper的典型应用场景](https://blog.csdn.net/u013679744/article/details/79371022)


  [1]: http://zookeeper.apache.org/doc/r3.5.6/images/zkservice.jpg
  [2]: http://zookeeper.apache.org/doc/r3.5.6/images/zknamespace.jpg
  [3]: http://zookeeper.apache.org/doc/r3.5.6/images/zkcomponents.jpg