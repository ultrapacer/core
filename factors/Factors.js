const list = require('./list')

class Factors {
  constructor(value) {
    Object.defineProperty(this, '_data', { value: {} })
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
        }
      })
    })
    Object.assign(this, value)
  }

  get combined() {
    return list.reduce((v, key) => {
      return v * this[key]
    }, 1)
  }
}

module.exports = Factors
