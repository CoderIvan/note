# Using nginx as HTTP load balancer

## Introduction
对多个应用实例进行负载均衡是一种为了优化资源利用、最大化吞率，减少延迟和确保容错性的通用技术

可以使用Nginx实现高效的HTTP负载均衡来对多个应用服务进行分流和使用Nginx提高Web应用的性能、可扩展性和可靠性。

## Load balancing methods
Nginx支持以下的负载均衡机制：
* round-robin — 到应用服务器的请求将被循环分发
* least-connected — 下个请求分发到最少活动连接的服务
* ip-hash — 使用`hash-function`确定下个请求应该分发到哪个服务（基于客户端的IP地址）

## Default load balancing configuration
Nginx负载均衡最简单的配置如下：
```
http {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://myapp1;
        }
    }
}
```
在上面的例子中，有3个相同的应用实例运行在`srv1`-`srv3`。当没有指定负载均衡的方式，默认为`round-robin`。所有请求将被`myapp1`服务集群代理，Nginx使用HTTP负载均衡方式分发请求。

在Nginx中的反向代理实现，包括了对HTTP、HTTPS、FastCGI、uwsgi、SCGI和memcached的负载均衡

要配置HTTPS负载均衡替代HTTP负载均衡，只需使用`https`协议即可。

当想要配置FastCGI、uwsgi、SCGI和memcached的负载均衡里，可以分别使用[fastcgi_pass](http://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_pass)、[uwsgi_pass](http://nginx.org/en/docs/http/ngx_http_uwsgi_module.html#uwsgi_pass)、[scgi_pass](http://nginx.org/en/docs/http/ngx_http_scgi_module.html#scgi_pass)和[memcached_pass](http://nginx.org/en/docs/http/ngx_http_memcached_module.html#memcached_pass)指令。

## Least connected load balancing
另外一种负载均衡方式就是`least-connected`。`least-connected`允许在有某些请求需要较长的时间处理时，更公平的控制各个应用实例的负载。

使用`least-connected`负载均衡里，nginx会尝试不发过多的请求使较忙的应用服务超载，而是把新的请求分发给较空闲的服务。

当在服务组配置[least_conn](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#least_conn)指令时，`Least-connnected`负载均衡将会在Nginx中生效：
```
upstream myapp1 {
    least_conn;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```

## Session persistence
请注意在`round-robin`或`least-connected`负载均衡中，每个后续的客户端请求将可能被分发到不同的服务器中。这里并不确保同一个客户端总是连接同一个服务器。

如果想需要把客户端和特定的应用服务器关联起来。in other words, make the client’s session “sticky” or “persistent” in terms of always trying to select a particular server。可以使用`ip_hash`负载均衡机制。

在`ip-hash`中，客户端的IP地址将会被用来做`hashing key`来决定客户端的请求将发送到服务群中的哪个服务。这个方法能确保同一个客户端的请求将总是导向到同一个服务，除非这个服务已经不可用了。

配置`ip-hash`负载均衡，只需要添加[ip-hash](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#ip_hash)指令到服务群(upstream)配置中：
```
upstream myapp1 {
    ip_hash;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```

## Weighted load balancing
也可以进一步使用`server weights`影响nginx的负载均衡算法。

In the examples above, the server weights are not configured which means that all specified servers are treated as equally qualified for a particular load balancing method.

With the round-robin in particular it also means a more or less equal distribution of requests across the servers — provided there are enough requests, and when the requests are processed in a uniform manner and completed fast enough.

当在服务中指定[weight](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)参数时，`weight`将作为负载平衡判定的一部分。
```
upstream myapp1 {
    server srv1.example.com weight=3;
    server srv2.example.com;
    server srv3.example.com;
}
```
使用该配置，每5个请求将会以以下的方式分发到应用实例中：3个请求将被导向到`srv1`，1个请求将被导向到`srv2`，另一个导向到`srv3`。

同样可以在最近的Nginx版本中对`least-connected`和`ip-hash`的负载平衡使用`weigths`。

## Health checks
Nginx中的反向代理实现包括服务`health checks`。如果特定的服务响应失败和错误，Nginx将会标记这个服务为故障，并短暂的避免为后续的入站请求选择这个服务。

[max_fails](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)指令设置连续尝试与服务通讯失败的次数(发送在[fail_timeout](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)期间)。默认地，[max_fails](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)设置为1。当设置为0时，该服务上的`health checks`将会关闭。[fail_timeout](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)参数定义了服务将被标记为故障多长时间。服务故障后经过[fail_timeout](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)后，nginx将开始优雅的使用当前的客户端请求探测服务。如果探测成功，这服务将会被重新标记为在线。

## Further reading
另外，在Nginx中，有更多的指令和参数来控制负载均衡，例如：[proxy_next_upstream](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream)， [backup](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)， [down](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#server)和[keepalive](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive)。更多的信息可以查阅[reference documentation](http://nginx.org/en/docs/).

Last but not least, [application load balancing](https://www.nginx.com/products/application-load-balancing/), [application health checks](https://www.nginx.com/products/application-health-checks/), [activity monitoring](https://www.nginx.com/products/live-activity-monitoring/) and [on-the-fly reconfiguration](https://www.nginx.com/products/on-the-fly-reconfiguration/) of server groups are available as part of our paid NGINX Plus subscriptions.

以下文章详细的介绍了Nginx Plus的负载均衡：
* [Load Balancing with NGINX and NGINX Plus](https://www.nginx.com/blog/load-balancing-with-nginx-plus/)
* [Load Balancing with NGINX and NGINX Plus part 2](https://www.nginx.com/blog/load-balancing-with-nginx-plus-part2/)

## 参考文章
* [Using nginx as HTTP load balancer](http://nginx.org/en/docs/http/load_balancing.html)