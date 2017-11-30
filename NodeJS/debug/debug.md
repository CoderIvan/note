# NodeJS Debug

## [Debugger](https://nodejs.org/api/debugger.html)

NodeJS内置的V8提供的一个调试器

```javascript
node debug ./demo/debugger.js
```

使用方式:

1. 在代码中添加`debugger`标签作为断点

2. 在`node`命令后追加`debug`以开启调试模式

总结：体验比较差，基本没什么用。

## [node-inspector](https://github.com/node-inspector/node-inspector)

> 由于[新版安装问题](https://github.com/node-inspector/node-inspector/issues/986)，使用cnpm安装v0.12.10版本

###### Install

```bash
$ npm install -g node-inspector
```

###### Start

```bash
$ node-debug app.js
```

## [Visual Studio Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)