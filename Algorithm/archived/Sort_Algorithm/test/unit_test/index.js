'use strict'

const chai = require('chai')
const expect = chai.expect
const Sort = require('../../')
const _ = require('lodash')

describe('Sort Algorithm', () => {
	let count = 5000
	let origin_array = []
	let result = []

	let array = []

	before(done => {
		for (let i = 0; i < count; i++) {
			let num = _.random(0, count * 10)
			origin_array.push(num)
			result.push(num)
		}
		result.sort((a, b) => {
			return a - b
		})
		done()
	})

	beforeEach(done => {
		array = _.clone(origin_array)
		done()
	})

	_.mapKeys(Sort, (sort, sortName) => {
		it(sortName, done => {
			try {
				sort(array)
				expect(array).eql(result)
				done()
			} catch (err) {
				done(err)
			}
		})
	})

})
