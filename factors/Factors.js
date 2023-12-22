import _ from 'lodash'

import { list } from './list.js'

export class Factors {
  constructor(value) {
    Object.defineProperty(this, '_data', { value: {} })
    Object.defineProperty(this, '_cache', { value: {} })

    list.forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          return this._data[key] || 1
        },
        set(v) {
          if (v !== 1) {
            this._data[key] = v
          } else {
            delete this._data[key]
          }
          delete this._cache.combined
        }
      })
    })
    Object.assign(this, value)
  }

  get combined() {
    if (!_.has(this._cache, 'combined')) {
      this._cache.combined = list.reduce((v, key) => {
        return v * this[key]
      }, 1)
    }
    return this._cache.combined
  }
}
