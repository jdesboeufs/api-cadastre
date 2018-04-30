#!/usr/bin/env node
require('dotenv').config()
const {resolve} = require('path')
const {promisify} = require('util')
const workerFarm = require('worker-farm')
const mongo = require('../util/mongo')
const {getCodesDepartements} = require('../cog')

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

  await mongo.connect()

  console.log('Suppression des indexes et données existantes')
  await mongo.db.collection('feuilles').dropAllIndexes({})
  await mongo.db.collection('feuilles').remove({})

  console.log('Importation des données de chaque département')
  await Promise.all(departements.map(async departement => {
    const feuillesPath = resolve(
      cadastrePattern
        .replace(/{dep}/g, departement)
        .replace(/{layer}/g, 'feuilles')
    )
    await runWorker({feuillesPath, departement})
  }))

  workerFarm.end(farm)

  console.log('Création des indexes')
  await mongo.db.collection('feuilles').createIndex({contour: '2dsphere'})
  await mongo.db.collection('feuilles').createIndex({id: 1})

  await mongo.disconnect()
  console.log('Terminé')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
