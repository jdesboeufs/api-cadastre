const {omit} = require('lodash')
const {isValid} = require('./validate')

module.exports = [
  {
    name: 'communes',
    collectionName: 'communes',
    transform: obj => {
      const result = omit(obj, '_geometry')
      if (isValid(obj._geometry)) {
        result.contour = obj._geometry
      }
      return result
    },
    indexes: [
      {contour: '2dsphere'},
      {id: 1}
    ]
  },
  {
    name: 'lieux_dits',
    collectionName: 'lieux_dits',
    transform: obj => {
      const result = omit(obj, '_geometry')
      if (isValid(obj._geometry)) {
        result.contour = obj._geometry
      }
      return result
    },
    indexes: [
      {contour: '2dsphere'},
      {id: 1}
    ]
  },
  {
    name: 'sections',
    collectionName: 'sections',
    transform: obj => {
      const result = omit(obj, '_geometry')
      if (isValid(obj._geometry)) {
        result.contour = obj._geometry
      }
      return result
    },
    indexes: [
      {contour: '2dsphere'},
      {id: 1}
    ]
  },
  {
    name: 'feuilles',
    collectionName: 'feuilles',
    transform: obj => {
      const result = omit(obj, '_geometry')
      if (isValid(obj._geometry)) {
        result.contour = obj._geometry
      }
      return result
    },
    indexes: [
      {contour: '2dsphere'},
      {id: 1}
    ]
  },
  {
    name: 'parcelles',
    collectionName: 'parcelles',
    transform: obj => {
      const result = omit(obj, '_geometry')
      if (isValid(obj._geometry)) {
        result.contour = obj._geometry
      }
      return result
    },
    indexes: [
      {contour: '2dsphere'},
      {id: 1}
    ]
  }
]
