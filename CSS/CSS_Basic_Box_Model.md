# CSS Basic Box Model

* Content area
* Padding area
* Border area
* Margin area

你对一个元素所设置的 width 与 height 只会应用到这个元素的内容区。如果这个元素有任何的 border 或 padding ，绘制到屏幕上时的盒子宽度和高度会加上设置的边框和内边距值。

```html
<!DOCTYPE html>
<html>
<head>
<style> 
.div01 {
  background-color: red;
  width: 200px;
  height: 200px;
}
.div02 {
  background-color: yellow;
  width: 240px;
  height: 240px;
}
.div03 {
  background-color: blue;
  width: 200px;
  height: 200px;
  padding: 10px;
  border: 10px solid #000088;
}
</style>
</head>
<body>

<div class="div01">
	这是一个段落。
</div>

<div class="div02">
	这是一个段落。
</div>

<div class="div03">
	这是一个段落。
</div>

</body>
</html>
```

![image](https://user-images.githubusercontent.com/7960859/72031455-70c41200-32c7-11ea-849c-9c5a6767d7fd.png)

# 参考
> [CSS 基础框盒模型介绍](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model)
