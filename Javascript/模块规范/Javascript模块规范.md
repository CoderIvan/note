# Javascript模块规范

## AMD
	The Asynchronous Module Definition

* 实现
	* RequireJS
	* curl.js

## CommonJS

* 实现
	* Browserify 
	* Node.js

## 区别

* 加载方式
	* CommonJS规范加载模块是同步的
	* AMD规范则是非同步加载模块，允许指定回调函数

## 引用

* [阮一峰 -- Javascript模块化编程](http://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html)

* [阮一峰 -- 前端模块管理器简介](http://www.ruanyifeng.com/blog/2014/09/package-management.html)

* [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)

* [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1)