# B-Tree和B+Tree
目前大部分数据库系统及文件系统都采用B-Tree或其变种B+Tree作为索引结构，在本文的下一节会结合存储器原理及计算机存取原理讨论为什么B-Tree和B+Tree在被如此广泛用于索引，这一节先单纯从数据结构角度描述它们。

## B-Tree
为了描述B-Tree，首先定义一条数据记录为一个二元组[key, data]，key为记录的键值，对于不同数据记录，key是互不相同的；data为数据记录除key外的数据。那么B-Tree是满足下列条件的数据结构：

1. d为大于1的一个正整数，称为B-Tree的度。

1. h为一个正整数，称为B-Tree的高度。

1. 每个非叶子节点由n-1个key和n个指针组成，其中d<=n<=2d。

1. 每个叶子节点最少包含一个key和两个指针，最多包含2d-1个key和2d个指针，叶节点的指针均为null 。

1. 所有叶节点具有相同的深度，等于树高h。

1. key和指针互相间隔，节点两端是指针。

1. 一个节点中的key从左到右非递减排列。

1. 所有节点组成树结构。

1. 每个指针要么为null，要么指向另外一个节点。

1. 如果某个指针在节点node最左边且不为null，则其指向节点的所有key小于v(key1)，其中v(key1)为node的第一个key的值。

1. 如果某个指针在节点node最右边且不为null，则其指向节点的所有key大于v(keym)，其中v(keym)为node的最后一个key的值。

1. 如果某个指针在节点node的左右相邻key分别是keyi和keyi+1且不为null，则其指向节点的所有key小于v(keyi+1)且大于v(keyi)。

一个d=2的B-Tree示意图：

![](image281.png)

## B+Tree
B-Tree有许多变种，其中最常见的是B+Tree，例如MySQL就普遍使用B+Tree实现其索引结构。

与B-Tree相比，B+Tree有以下不同点：

1. 每个节点的指针上限为2d而不是2d+1。

1. 内节点不存储data，只存储key；叶子节点不存储指针。

一个d=2的B+Tree示意图：

![](image4.png)

#### 带有顺序访问指针的B+Tree

![](image381.png)

## 参考文章

> http://blog.jobbole.com/24006/

> https://en.wikipedia.org/wiki/B-tree