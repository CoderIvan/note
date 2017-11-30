# 闭包引起的内存泄漏

## 一个真实的例子 — The Meteor Case-Study

在 2013 年，Meteor 的作者宣布了他们碰到的关于内存泄露的发现，问题代码如下所示：

```javascript
var theThing = null  
var replaceThing = function () {  
  var originalThing = theThing
  var unused = function () {
    if (originalThing)
      console.log("hi")
  }
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage)
    }
  };
};
setInterval(replaceThing, 1000)
```

> Well, the typical way that closures are implemented is that every function object has a link to a dictionary-style object representing its lexical scope. If both functions defined inside replaceThing actually used originalThing, it would be important that they both get the same object, even if originalThing gets assigned to over and over, so both functions share the same lexical environment. Now, Chrome’s V8 JavaScript engine is apparently smart enough to keep variables out of the lexical environment if they aren’t used by any closures - from the Meteor blog.

## Lexical scoping

> To define it somewhat circularly, lexical scope is scope that is defined at lexing time. In other words, lexical scope is based on where variables and blocks of scope are authored, by you, at write time, and thus is (mostly) set in stone by the time the lexer processes your code.


## 引用

> [NodeJS垃圾回收](https://eggggger.xyz/2016/10/22/node-gc/)

> [Node.js Garbage Collection Explained](https://blog.risingstack.com/node-js-at-scale-node-js-garbage-collection/?utm_source=nodeweekly&utm_medium=email)

> [Lexical Scope](https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch2.md)