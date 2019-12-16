'use strict'

module.exports = (sr) => {
	let tr = new Array(sr.length)
	let k = 1
	while (k < sr.length) {
		mergePass(sr, tr, k, sr.length - 1)
		k *= 2
		mergePass(tr, sr, k, sr.length - 1)
		k *= 2
	}
}

function mergePass(sr, tr, s, n) {
	let i
	let j
	for (i = 0; i <= n - 2 * s - 1; i += 2 * s) {
		merge(sr, tr, i, i + s - 1, i + 2 * s - 1)
	}
	if (i < n - s + 1) {
		merge(sr, tr, i, i + s - 1, n)
	} else {
		for (j = i; j <= n; j++) {
			tr[j] = sr[j]
		}
	}
}

function merge(sr, tr, i, m, n) {
	let j, k, l
	for (j = m + 1, k = i; i <= m && j <= n; k++) {
		tr[k] = sr[i] < sr[j] ? sr[i++] : sr[j++]
	}
	if (i <= m) {
		for (l = 0; l <= m - i; l++) {
			tr[k + l] = sr[i + l]
		}
	}
	if (j <= n) {
		for (l = 0; l <= n - j; l++) {
			tr[k + l] = sr[j + l]
		}
	}
}
