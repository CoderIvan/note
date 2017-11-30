# MQTT

Message Queue Telemetry Transport


## 鉴权

Client连接鉴权只能依赖于CONNECT控制报文

CONNECT提供的信息有限，只有Username与Password

#### 方案1

MQTT服务维护一张白名单，控制Machine是否能连接上MQTT

Terminal信息导入Admin的时候，创建MQTT账号，SN为username，IMEI为password

Terminal连接MQTT时，MQTT查询白名单，判断username与password是否有效

## 性能

CPU: `Intel(R) Xeon(R) CPU           E5620  @ 2.40GHz`

Client订阅唯一的Topic，然后往该Topic上推送信息

| Client数 | 信息数 | 总用时 | QPS |
|--------|--------|--------|--------|
| 100    | 100    | 3633ms | 2752   |
| 10     | 1000   | 3123ms | 3202   |
| 1000   | 10     | 4681ms | 2136   |

## 参考

> [CONNECT](https://mcxiaoke.gitbooks.io/mqtt-cn/content/mqtt/0301-CONNECT.html)

> [安全](https://mcxiaoke.gitbooks.io/mqtt-cn/content/mqtt/05-Security.html)
