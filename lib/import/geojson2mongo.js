const {promisify, callbackify} = require('util')
const {createReadStream} = require('fs')
const got = require('got')
const {createGunzip} = require('gunzip-stream')
const pipe = promisify(require('mississippi').pipe)
const {through} = require('mississippi')
const {parse} = require('../util/geojson')

function createTransform(transformFn) {
  if (!transformFn) {
    throw new Error('transformFn is required')
  }

  return through.obj(
    (item, enc, cb) => {
      cb(null, transformFn(item))
    }
  )
}

function flattenGeoJSON() {
  return through.obj(
    (feature, enc, cb) => {
      cb(null, {
        ...feature.properties,
        _geometry: feature.geometry
      })
    }
  )
}

function bucketize(bucketSize) {
  if (!bucketSize) {
    throw new Error('bucketSize is required')
  }

  let bucket = []
  return through.obj(
    function (item, enc, cb) {
      if (bucket.length === bucketSize) {
        this.push(bucket)
        bucket = []
      }
      bucket.push(item)
      cb()
    },
    function (cb) {
      if (bucket.length > 0) {
        this.push(bucket)
      }
      cb()
    }
  )
}

function insertBuckets(collection) {
  const iteratee = callbackify(async bucket => {
    await collection.insertMany(bucket)
  })
  return through.obj(iteratee)
}

function getInputStream(path) {
  if (path.startsWith('http')) {
    return got.stream(path)
  }
  return createReadStream(path)
}

async function geojson2mongo(geojsonPath, collection, options = {}) {
  const transformFn = options.transformFn || (x => x)
  const bucketSize = options.bucketSize || 1000

  await pipe(
    getInputStream(geojsonPath),
    createGunzip(),
    parse(),
    flattenGeoJSON(),
    createTransform(transformFn),
    bucketize(bucketSize),
    insertBuckets(collection)
  )
}

module.exports = geojson2mongo
