const {keyBy} = require('lodash')
const departements = require('@etalab/cog/data/departements.json')

const departementsIndex = keyBy(departements, 'code')

function getCodesDepartements() {
  return Object.keys(departementsIndex)
}

module.exports = {getCodesDepartements}
