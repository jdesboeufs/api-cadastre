const test = require('ava')
const {isValid} = require('../lib/import/validate')

test('duplicate vertices', t => {
  const geometry = require('./fixtures/validate/duplicate-vertices.json')
  t.false(isValid(geometry))
})

test('weird holes', t => {
  const geometry = require('./fixtures/validate/weird-holes.json')
  t.false(isValid(geometry))
})

test('incredible self intersection', t => {
  const geometry = require('./fixtures/validate/incredible-self-intersection.json')
  t.false(isValid(geometry))
})

test('weird holes 2', t => {
  const geometry = require('./fixtures/validate/weird-holes-2.json')
  t.false(isValid(geometry))
})
