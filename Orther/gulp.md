## gulp.task(name[, deps], fn)
定义一个使用 Orchestrator 实现的任务（task）。

```javascript
gulp.task('somename', function() {
  // 做一些事
});
```
* name
	任务的名字，如果你需要在命令行中运行你的某些任务，那么，请不要在名字中使用空格。
* deps
	类型： Array
	一个包含任务列表的数组，这些任务会在你当前任务运行之前完成。
```javascript
gulp.task('mytask', ['array', 'of', 'task', 'names'], function() {
  // 做一些事
});
```
    注意： 你的任务是否在这些前置依赖的任务完成之前运行了？请一定要确保你所依赖的任务列表中的任务都使用了正确的异步执行方式：使用一个 callback，或者返回一个 promise 或 stream。

* fn

    该函数定义任务所要执行的一些操作。通常来说，它会是这种形式：gulp.src().pipe(someplugin())。

    异步任务支持

    任务可以异步执行，如果 fn 能做到以下其中一点：

	接受一个 callback:
    ```javascript
    // 在 shell 中执行一个命令
    var exec = require('child_process').exec;
    gulp.task('jekyll', function(cb) {
      // 编译 Jekyll
      exec('jekyll build', function(err) {
        if (err) return cb(err); // 返回 error
        cb(); // 完成 task
      });
    });
    ```
	返回一个 stream

    ```javascript
    gulp.task('somename', function() {
      var stream = gulp.src('client/**/*.js')
        .pipe(minify())
        .pipe(gulp.dest('build'));
      return stream;
    });
    ```
    返回一个 promise

    ```javascript
    var Q = require('q');

    gulp.task('somename', function() {
      var deferred = Q.defer();

      // 执行异步的操作
      setTimeout(function() {
        deferred.resolve();
      }, 1);

      return deferred.promise;
    });
    ```
_ _ _

##### 注意： 默认的，task 将以最大的并发数执行，也就是说，gulp 会一次性运行所有的 task 并且不做任何等待。如果你想要创建一个序列化的 task 队列，并以特定的顺序执行，你需要做两件事：
* 给出一个提示，来告知 task 什么时候执行完毕，
* 并且再给出一个提示，来告知一个 task 依赖另一个 task 的完成。
对于这个例子


##### 让我们先假定你有两个 task，"one" 和 "two"，并且你希望它们按照这个顺序执行：

 * 在 "one" 中，你加入一个提示，来告知什么时候它会完成：可以再完成时候返回一个 callback，或者返回一个 promise 或 stream，这样系统会去等待它完成。
 * 在 "two" 中，你需要添加一个提示来告诉系统它需要依赖第一个 task 完成。

##### 因此，这个例子的实际代码将会是这样：
```javascript
var gulp = require('gulp');

// 返回一个 callback，因此系统可以知道它什么时候完成
gulp.task('one', function(cb) {
    // 做一些事 -- 异步的或者其他的
    cb(err); // 如果 err 不是 null 或 undefined，则会停止执行，且注意，这样代表执行失败了
});

// 定义一个所依赖的 task 必须在这个 task 执行之前完成
gulp.task('two', ['one'], function() {
    // 'one' 完成后
});

gulp.task('default', ['one', 'two']);
```