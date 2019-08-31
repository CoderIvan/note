/*
* a, b 均为有序数组
*/
function merge(a, b) {
	const result = []
	let i = 0
	let j = 0
	// 对比A数组与B数组，把小的值放到结果集里
	while (i < a.length && j < b.length) {
		if (a[i] <= b[j]) {
			result.push(a[i])
			i += 1
		} else {
			result.push(b[j])
			j += 1
		}
	}
	// 把剩余的元素放到结果集中
	if (i < a.length) {
		result.push(...a.slice(i))
	} else if (j < b.length) {
		result.push(...b.slice(j))
	}
	return result
}

// 递归合并，最终拆成1个和1个合并
function mergePass(sr) {
	if (sr.length === 1) {
		return sr
	}
	const m = Math.floor(sr.length / 2)
	return merge(mergePass(sr.slice(0, m)), mergePass(sr.slice(m)))
}

module.exports = (sr) => {
	const tr = mergePass(sr)
	for (let i = 0; i < tr.length; i += 1) {
		sr[i] = tr[i]
	}
	return tr
}
