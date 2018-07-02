#!/usr/bin/env node
require('dotenv').config()
const {resolve} = require('path')
const {promisify} = require('util')
const bluebird = require('bluebird')
const workerFarm = require('worker-farm')
const mongo = require('../util/mongo')
const {getCodesDepartements} = require('../cog')
const models = require('./models')

const codesDepartements = getCodesDepartements()

function getDepartements() {
  if (!process.env.DEPARTEMENTS) {
    return codesDepartements
  }
  const departements = process.env.DEPARTEMENTS.split(',')
  if (departements.length === 0) {
    throw new Error('La liste de départements fournie est mal formée')
  }
  if (departements.some(codeDep => !codesDepartements.includes(codeDep))) {
    throw new Error('La liste de départements fournie est invalide')
  }
  return departements
}

const cadastrePattern = process.env.CADASTRE_PATTERN
const departements = getDepartements()

function getPath(path) {
  return path.startsWith('http') ? path : resolve(path)
}

async function main() {
  const workerFarmOptions = {
    maxConcurrentCallsPerWorker: 1,
    maxRetries: 0,
    workerOptions: {
      execArgv: ['--max-old-space-size=2048']
    }
  }
  const farm = workerFarm(workerFarmOptions, require.resolve('./worker'))
  const runWorker = promisify(farm)

  await mongo.connect({socketTimeout: 3600})

  await bluebird.mapSeries(models, async model => {
    console.log(`* ${model.name}`)
    await mongo.db.createCollection(model.collectionName)
    console.log('    suppression des index existants')
    await mongo.db.collection(model.collectionName).dropAllIndexes({})
    console.log('    suppression des données existantes')
    await mongo.db.collection(model.collectionName).remove({})

    console.log('    importation des données de chaque département')
    await Promise.all(departements.map(async departement => {
      const geojsonPath = getPath(
        cadastrePattern
          .replace(/{dep}/g, departement)
          .replace(/{layer}/g, model.name)
      )
      await runWorker({geojsonPath, modelName: model.name})
    }))

    console.log('    création des index')
    await Promise.all(model.indexes.map(index => {
      return mongo.db.collection(model.collectionName).createIndex(index)
    }))
  })

  workerFarm.end(farm)

  await mongo.disconnect()
  console.log('Terminé')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
