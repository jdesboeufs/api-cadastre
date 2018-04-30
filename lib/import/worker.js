const {callbackify} = require('util')
const {createReadStream} = require('fs')
const {createGunzip} = require('gunzip-stream')
const getStream = require('get-stream')
const pumpify = require('pumpify')
const {parse} = require('../util/geojson')
const mongo = require('../util/mongo')
const {isValid} = require('./validate')

async function importData({feuillesPath, departement}) {
  await mongo.connect()
  console.log('Importation des données du département ' + departement)

  const feuilles = await getStream.array(
    pumpify.obj(
      createReadStream(feuillesPath),
      createGunzip(),
      parse()
    )
  )

  await mongo.db.collection('feuilles').insertMany(
    feuilles.map(featureToObject).filter(x => x)
  )
}

function featureToObject(feature) {
  if (isValid(feature.geometry)) {
    return {
      ...feature.properties,
      contour: feature.geometry
    }
  }
  console.error(`Feuille ${feature.properties.id}: géométrie invalide`)
  return {...feature.properties}
}

module.exports = callbackify(importData)
