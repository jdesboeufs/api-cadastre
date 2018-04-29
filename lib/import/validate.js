const {polygon, booleanContains} = require('@turf/turf')

function polygonIsValid(polygonRings) {
  if (polygonRings.length === 0) {
    console.log('Polygon without rings')
    return false
  }
  if (polygonRings.length === 1) {
    return true
  }
  const [exteriorRing, ...holes] = polygonRings
  const exteriorPolygon = polygon([exteriorRing])
  return holes.every(hole => {
    const holePolygon = polygon([hole])
    return booleanContains(exteriorPolygon, holePolygon)
  })
}

function multiPolygonIsValid(polygonsRings) {
  return polygonsRings.every(polygonIsValid)
}

function isValid(geometry) {
  if (geometry.type === 'Polygon') {
    return polygonIsValid(geometry.coordinates)
  }
  if (geometry.type === 'MultiPolygon') {
    return multiPolygonIsValid(geometry.coordinates)
  }
}

module.exports = {polygonIsValid, multiPolygonIsValid, isValid}
