const {first, last} = require('lodash')
const {polygon, booleanWithin, intersect} = require('@turf/turf')

function polygonIsValid(polygonRings) {
  if (polygonRings.length === 0) {
    return false
  }
  if (!polygonRings.every(polygonRingIsValid)) {
    return false
  }
  if (polygonRings.length === 1) {
    return true
  }
  const [exteriorRing, ...holes] = polygonRings
  if (hasExteriorHoles(exteriorRing, holes)) {
    return false
  }
  if (hasCrossingHoles(holes)) {
    return false
  }
  return true
}

function hasCrossingHoles(holes = []) {
  const len = holes.length
  if (len === 0) {
    throw new Error('Holes array must not be empty')
  }
  if (len === 1) {
    return false
  }
  const holesPolygons = holes.map(h => polygon([h]))
  let ok = true
  let i = 0
  let j = 0
  while (ok && (i !== len - 1 || j !== len - 1)) {
    if (i < j && intersect(holesPolygons[i], holesPolygons[j])) {
      ok = false
    }
    if (i === len - 1) {
      j++
      i = 0
    } else {
      i++
    }
  }
  return !ok
}

function hasExteriorHoles(exteriorRing, holes) {
  const exteriorPolygon = polygon([exteriorRing])
  return holes.some(hole => {
    const holePolygon = polygon([hole])
    // TODO: support holes touching exterior on one point
    return !booleanWithin(holePolygon, exteriorPolygon)
  })
}

function multiPolygonIsValid(polygonsRings) {
  return polygonsRings.every(polygonIsValid)
}

function coordsToString(coords, precision = 7) {
  return `${coords[0].toFixed(precision)},${coords[1].toFixed(precision)}`
}

function ringIsClosed(ring) {
  return coordsToString(first(ring)) === coordsToString(last(ring))
}

function ringHasDuplicateVertices(ring) {
  let ok = true
  let cursor = 0
  const existingCoords = new Set()
  while (ok && cursor <= ring.length - 2) {
    const coords = coordsToString(ring[cursor])
    if (existingCoords.has(coords)) {
      ok = false
    } else {
      existingCoords.add(coords)
    }
    cursor++
  }
  return !ok
}

function polygonRingIsValid(ring) {
  if (ring.length < 4) {
    return false
  }
  if (!ringIsClosed(ring)) {
    return false
  }
  if (ringHasDuplicateVertices(ring)) {
    return false
  }
  return true
}

function isValid(geometry) {
  if (geometry.type === 'Polygon') {
    return polygonIsValid(geometry.coordinates)
  }
  if (geometry.type === 'MultiPolygon') {
    return multiPolygonIsValid(geometry.coordinates)
  }
}

module.exports = {polygonIsValid, multiPolygonIsValid, isValid, ringHasDuplicateVertices}
