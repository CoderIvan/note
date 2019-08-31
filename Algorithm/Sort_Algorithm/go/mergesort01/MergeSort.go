package main

import (
	"fmt"
	"math/rand"
	"time"
)

func merge(a []int, b []int) []int {
	var result []int
	i := 0
	j := 0
	// 对比A数组与B数组，把小的值放到结果集里
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] {
			result = append(result, a[i])
			i++
		} else {
			result = append(result, b[j])
			j++
		}
	}
	// 把剩余的元素放到结果集中
	if i < len(a) {
		result = append(result, a[i:]...)
	} else if j < len(b) {
		result = append(result, b[j:]...)
	}
	return result
}

func mergePass(ab []int) []int {
	if len(ab) == 1 {
		return ab
	}
	m := len(ab) / 2
	return merge(mergePass(ab[:m]), mergePass(ab[m:]))
}

func main() {
	array := make([]int, 1*1000*1000)
	for i := range array {
		array[i] = rand.Int()
	}

	startTime := time.Now()

	newArray := mergePass(array)

	fmt.Println("done:", time.Now().Sub(startTime))

	for i := 0; i < 100; i++ {
		fmt.Println(newArray[i])
	}

}
