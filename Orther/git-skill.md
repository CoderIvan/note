## 删除不存在对应远程分支的本地分支

假设这样一种情况：

1. 我创建了本地分支b1并pull到远程分支 origin/b1；
1. 其他人在本地使用fetch或pull创建了本地的b1分支；
1. 我删除了 origin/b1 远程分支；
1. 其他人再次执行fetch或者pull并不会删除这个他们本地的 b1 分支，运行 git branch -a 也不能看出这个branch被删除了，如何处理？

使用下面的代码查看b1的状态：

```bash
$ git remote show origin
* remote origin
  Fetch URL: git@github.com:xxx/xxx.git
  Push  URL: git@github.com:xxx/xxx.git
  HEAD branch: master
  Remote branches:
    master                 tracked
    refs/remotes/origin/b1 stale (use 'git remote prune' to remove)
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)
```

这时候能够看到b1是stale的，使用`git remote prune origin`可以将其从本地版本库中去除。

更简单的方法是使用这个命令，它在fetch之后删除掉没有与远程分支对应的本地分支：

```
git fetch -p
```

```
git-fetch
	Download objects and refs from another repository

-p, --prune
	Before fetching, remove any remote-tracking references that no longer exist on the remote. 
	Tags are not subject to pruning if they are fetched only because of the default tag auto-following or due to a --tags option.
	However, if tags are fetched due to an explicit refspec (either on the command line or in the remote configuration, for example if the remote was cloned with the --mirror option), then they are also subject to pruning.
```
