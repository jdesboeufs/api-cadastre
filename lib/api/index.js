#!/usr/bin/env
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {bboxPolygon} = require('@turf/turf')
const wrap = require('../util/wrap')
const mongo = require('../util/mongo')

const app = express()

function badRequest(message) {
  const err = new Error(message)
  err.badRequest = true
  return err
}

app.use(cors())

app.get('/feuilles/:commune/:prefixe/:section/:feuille', wrap(async req => {
  const {commune, prefixe, section, feuille} = req.params
  return mongo.db.collection('feuilles').findOne({
    id: `${commune}${prefixe}${section}${feuille}`
  })
}))

app.get('/feuilles', wrap(async req => {
  if (!req.query.bbox) {
    throw badRequest('bbox is required')
  }
  const bbox = req.query.bbox.split(',').map(Number.parseFloat)
  if (bbox.length !== 4 || bbox.some(Number.isNaN)) {
    throw badRequest('bbox is malformed')
  }
  return mongo.db.collection('feuilles')
    .find({
      contour: {
        $geoIntersects: {
          $geometry: bboxPolygon(bbox).geometry
        }
      }
    })
    .project({contour: 0, _id: 0})
    .toArray()
}))

const port = process.env.PORT || 5000

async function main() {
  await mongo.connect()

  app.listen(port, () => {
    console.log('Start listening on port ' + port)
  })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
