/* eslint-env mocha */
const chai = require('chai')

const { expect } = chai
const Sort = require('../../')

describe('Sort Algorithm', () => {
	const count = 5000
	let originArray = []
	let resultArray = []

	let array = []

	before(() => {
		originArray = Array.from({ length: count }).map(() => Math.random())

		resultArray = [...originArray].sort()
	})

	beforeEach(() => {
		array = [...originArray]
	})

	Object.keys(Sort).forEach((sortName) => {
		it(sortName, () => {
			Sort[sortName](array)
			expect(array).eql(resultArray)
		})
	})
})
