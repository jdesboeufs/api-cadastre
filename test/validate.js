const test = require('ava')
const {isValid} = require('../lib/import/validate')

test('duplicate vertices', t => {
  const geometry = require('./fixtures/validate/duplicate-vertices.json')
  t.false(isValid(geometry))
})
