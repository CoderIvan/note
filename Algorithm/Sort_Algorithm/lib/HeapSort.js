'use strict'

module.exports = (array) => {
	let i
	let temp
	for (i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
		heapAdjust(array, i, array.length - 1)
	}
	for (i = array.length - 1; i > 0; i--) {
		temp = array[0]
		array[0] = array[i]
		array[i] = temp
		heapAdjust(array, 0, i - 1)
	}
}

function heapAdjust(array, start, end) {
	let i
	let temp = array[start]
	for (i = 2 * start + 1; i <= end; i = i * 2 + 1) {
		if (i < end && array[i] < array[i + 1]) {
			i++
		}
		if (temp >= array[i]) {
			break
		}
		array[start] = array[i]
		start = i
	}
	array[start] = temp
}
