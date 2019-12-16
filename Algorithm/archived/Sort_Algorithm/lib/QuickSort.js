'use strict'

module.exports = (array) => {
	qSort(array, 0, array.length - 1)
}

function qSort(array, low, high) {
	if (high > low) {
		if (high - low > 7) {
			let pivot
			while (low < high) {
				pivot = partition(array, low, high)
				qSort(array, low, pivot - 1)
				low = pivot + 1
			}
		} else {
			InsertionSort(array, low, high)
		}
	}
}

function partition(array, low, high) {
	let pivotKey = array[low]
	while (low < high) {
		while (low < high && array[high] >= pivotKey) {
			high--
		}
		array[low] = array[high]
		while (low < high && array[low] <= pivotKey) {
			low++
		}
		array[high] = array[low]
	}
	array[low] = pivotKey
	return low
}

function InsertionSort(array, start, end) {
	let temp, i, j
	for (i = start; i < end + 1; i++) {
		temp = array[i]
		for (j = i - 1; j >= 0 && array[j] > temp; j -= 1) {
			array[j + 1] = array[j]
		}
		array[j + 1] = temp
	}
}
