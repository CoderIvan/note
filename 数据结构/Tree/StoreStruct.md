# Store Struct 树的存储结构

## 双亲表示法

```
define MAX_TREE_SIZE 100
typeof struct PTNode {
	TElemType data;
    int parent;
} PTNode;

typeof struct {
	PTNode nodes[MAX_TREE_SIZE];
    int r, n;
} PTree;
```

## 孩子表示法

```
typeof struct CSNode {
	ElemType data;
    struct CSNode * firstchild, * nextsibling;
} CSNode, * CSTree;
```

## 孩子兄弟表示法 (二叉树表示法) (二叉链表表示法)

```
typeof struct CSNode {
	ElemType data;
    struct CSNode * firstchild, * nextsibling;
} CSNode, * CSTree;
```