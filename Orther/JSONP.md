### 页面代码
```javascript
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
        <script type="text/javascript">
            function test(data) {
                console.log('status = %s', data.status)
                console.log('data = %s', JSON.stringify(data.result))
            }
        </script>
        <script type="text/javascript" src="http://api.map.baidu.com/geocoder/v2/?address=%E7%99%BE%E5%BA%A6%E5%A4%A7%E5%8E%A6&output=json&ak=81f0b3333061a2447465ab09b6382ae4&callback=test"></script>
    </head>
    <body>

    </body>
</html>
```

### 服务器响应:
```json
test&&test({"status":0,"result":{"location":{"lng":116.30783584945,"lat":40.056876296398},"precise":1,"confidence":80,"level":"\u5546\u52a1\u5927\u53a6"}})
```

### 结论:
* 代码会马上执行，所以将会调用页面代码中定义的test函数
* test函数需要在script脚本之前，否则可能由于加载顺序的不同而报test is undefined
* 怎么调用指定的callback，一定程度上由服务器决定，例如上述中返回了`test&&test(xxx)`，意思是当test存在则传入参数并执行test函数。同理，服务器也可以直接返回test(xxx)，区别不细说。