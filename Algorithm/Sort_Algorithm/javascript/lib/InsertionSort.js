'use strict'

module.exports = (array) => {
	let temp, i, j
	for (i = 1; i < array.length; i++) {
		temp = array[i]
		for (j = i - 1; j >= 0 && array[j] > temp; j -= 1) {
			array[j + 1] = array[j]
		}
		array[j + 1] = temp
	}
}
