# CSRF

Cross Site Request Forgery

跨站点伪造请求

### 产生流程

1. 访问并登录网站A
2. 验证成功并生成Cookie
3. 访问恶意网站B
4. 恶意网站B发起请求访问网站A
5. 网站A执行恶意网站B的请求

### CSRF漏洞防御

* 验证HTTP Referer字段
* 在请求地址中添加token并验证
* 在HTTP头中自定义属性并验证

### Reference

> [WiKi](https://en.wikipedia.org/wiki/Cross-site_request_forgery)

> [WiKi 中文](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0)
