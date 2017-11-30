## Example 01
```javascript
/\.(png|ico|gif|jpg|jpeg|woff|woff2|ttf|eot|svg|wav)(\?.+)?$/i
```

* `\.`
    * 匹配以`.`以开始
* `(png|ico|gif|jpg|jpeg|woff|woff2|ttf|eot|svg|wav)`
    * 匹配其中一个词组
* `(\?.+)?`
    * `(\?.+)`
        * 以?开头的，后面带1个或多个任意字符
    * `?` 
        * 上述匹配，有0个或1个

## References

[在线正则表达式测试](http://tool.oschina.net/regex)
