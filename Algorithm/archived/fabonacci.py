import time

def fib01(n):
    if n == 1 or n == 2:
        return 1
    return fib01(n - 2) + fib01(n - 1)

def fib02(n, acc1 = 1, acc2 = 1):
    if n == 0 or n == 1:
        return acc1
    return fib02(n - 1, acc2, acc1 + acc2)

def fib03(n):
    if n == 0 or n == 1:
        return 1
    else:
        arr = [i for i in range(n)]
        arr[1] = 1
        arr[2] = 2
        for x in range(3, n):
            arr[x] = arr[x-1] + arr[x-2]
        return arr[n - 1]

def test(func):
    now = time.time() * 1000
    result = func()
    print("result = %d, use time = %d ms" % (result, time.time() * 1000 - now))

for x in [fib01, fib02, fib03]:
    test(lambda : x(25))
