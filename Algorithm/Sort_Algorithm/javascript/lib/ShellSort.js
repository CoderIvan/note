'use strict'

module.exports = (array) => {
	let step, temp, i, j
	for (step = array.length >> 1; step > 0; step >>= 1) {
		for (i = step; i < array.length; i++) {
			temp = array[i]
			for (j = i - step; j >= 0 && array[j] > temp; j -= step) {
				array[j + step] = array[j]
			}
			array[j + step] = temp
		}
	}
}
