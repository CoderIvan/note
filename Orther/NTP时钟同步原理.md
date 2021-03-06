# NTP时钟同步原理

标签（空格分隔）： 未分类

---

# NTP协议简介

网络时间协议NTP(Network Time Protocol)，用于将某个机器的时间同步至另一个机器。

实际应用中，还有确保秒级精度的简单的网络时间协议SNTP(Simple Network Time Protocol)。SNTP是NTP的一个子集,主要用于那些不需要NTP的精度以较高实现复杂性的网络时间同步客户机。

一般的计算机和嵌入式设备在时钟度方面没有明确的指标要求,时钟精度只有10-4～10-5，每天可能误差达十几秒或更多，如果不及时校正，其累积时间误差不可忽视。

# NTP授时原理

NTP最典型的授时方式是Client/Server方式。

1. 客户机首先向服务器发送一个NTP 包，其中包含了该包离开客户机的时间戳T1。
2. 当服务器接收到该包时，依次填入包到达的时间戳T2、包离开的时间戳T3，然后立即把包返回给客户机。
3. 客户机在接收到响应包时，记录包返回的时间戳T4。

![image](https://user-images.githubusercontent.com/7960859/83228353-c3d82c00-a1b8-11ea-89c3-b231e9ad1b65.png)

1. T1为客户发送NTP请求时间戳(以客户时间为参照)
2. T2为服务器收到NTP请求时间戳(以服务器时间为参照)
3. T3为服务器回复NTP请求时间戳(以服务器时间为参照)
4. T4为客户收到NTP回复包时间戳(以客户时间为参照)
5. d1为NTP请求包传送延时
6. d2为NTP回复包传送延时
7. t为服务器和客户端之间的时间偏差
8. d为NTP包的往返时间。

现已经T1、T2、T3、T4，希望求得t以调整客户方时钟：

![image](https://user-images.githubusercontent.com/7960859/83229147-0b12ec80-a1ba-11ea-857f-6c687de6a58c.png)....................................................式(1)

假设NPT请求和回复包传送延时相等，即d1=d2，则可解得

![image](https://user-images.githubusercontent.com/7960859/83229154-0e0ddd00-a1ba-11ea-95b6-099c4526ac04.png) .....................................式(2)

根据式(1)，t也可表示为：t=(T2-T1)+d1=(T2-T1)+d/2.....................式(3)

可以看出，t、d只与T2、T1差值及T3、T4差值相关，而与T2、T3差值无关，即最终的结果与服务器处理请求所需的时间无关。因此，客户端即可通过T1、T2、T3、T4计算出时差t去调整本地时钟。

# NTP授时精度分析

NTP授时精度与NTP服务器与用户间的网络状况有关，主要取决于NTP包往返路由的延时对称程度，往返路由的延时不对称值最大不超过网络延时。

式(2)是在假设NTP请求和回复包在网上传送延时相等，即d1=d2=d/2的情况下得出的，而d1、d2的取值范围在(0...d)间，由式(3)可以得出最大授时误差是±d/2。

# 参考
> [NTP时钟同步原理及误差简析](https://www.vfe.ac.cn/NewsDetail-2332.aspx)



