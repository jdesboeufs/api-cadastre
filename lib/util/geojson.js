const JSONStream = require('JSONStream')

function stringify() {
  return JSONStream.stringify('{"type":"FeatureCollection","features":[\n', ',\n', ']}\n')
}

function parse() {
  return JSONStream.parse('features.*')
}

module.exports = {parse, stringify}
