#!/usr/bin/env node
require('dotenv').config()
const {resolve} = require('path')
const {promisify} = require('util')
const workerFarm = require('worker-farm')
const mongo = require('../util/mongo')

const cadastrePattern = resolve(process.env.CADASTRE_PATTERN)
const departements = process.env.DEPARTEMENTS.split(',')

async function main() {
  const workerFarmOptions = {
    maxConcurrentCallsPerWorker: 1,
    maxRetries: 0,
    workerOptions: {
      execArgv: ['--max-old-space-size=2096']
    }
  }
  const farm = workerFarm(workerFarmOptions, require.resolve('./worker'))
  const runWorker = promisify(farm)

  await mongo.connect()
  await mongo.db.collection('feuilles').dropAllIndexes({})
  await mongo.db.collection('feuilles').remove({})

  await Promise.all(departements.map(async departement => {
    const feuillesPath = cadastrePattern
      .replace('{dep}', departement)
      .replace('{layer}', 'feuilles')
    await runWorker({feuillesPath})
  }))

  workerFarm.end(farm)

  await mongo.db.collection('feuilles').createIndex({contour: '2dsphere'})
  await mongo.db.collection('feuilles').createIndex({id: 1})

  await mongo.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})