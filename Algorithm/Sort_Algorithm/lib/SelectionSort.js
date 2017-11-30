'use strict'

module.exports = (array) => {
	let i, j, min, temp
	for (i = 0; i < array.length - 1; i++) {
		min = i
		for (j = i + 1; j < array.length; j++) {
			if (array[j] < array[min]) {
				min = j
			}
		}
		temp = array[min]
		array[min] = array[i]
		array[i] = temp
	}
}
