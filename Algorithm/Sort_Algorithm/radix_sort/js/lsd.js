/**
 * Least Significant Digit first
 */

function sort(array, radix=10) {
	const K = Math.floor(Math.log(Math.max(...array), radix))
	let sortedArray = array
	for (let i = 0; i < K; i++) {
		let bucket = []
		sortedArray.forEach(num => {
			const k = Math.floor(num / (10 ** i)) % 10
			if (!bucket[k]) {
				bucket[k] = []
			}
			bucket[k].push(num)
		})
		console.log(bucket.join(', '))
		sortedArray = [].concat(...bucket.filter(e => !!e))
	}
	return sortedArray
}

function main() {
	let array = []
	for (let i = 0 ; i < 20; i < i++) {
		array.push(Math.floor(Math.random() * 1000))
	}
	console.log(array.join(', '))
	const sortedArray = sort(array)
	console.log(sortedArray.join(', '))
}

main()