const {callbackify} = require('util')
const mongo = require('../util/mongo')
const geojson2mongo = require('./geojson2mongo')
const models = require('./models')

async function importData({geojsonPath, modelName}) {
  const model = models.find(m => m.name === modelName)

  console.log('        ' + geojsonPath)

  await mongo.connect()

  await geojson2mongo(
    geojsonPath,
    mongo.db.collection(model.collectionName),
    {transformFn: model.transform}
  )
}

module.exports = callbackify(importData)
