const _ = require('lodash')

class Segment {
  constructor (obj) {
    Object.defineProperty(this, '_data', { value: {} })

    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  set name (v) {
    this._data.name = v
  }

  get name () {
    return this._data.name || this.waypoint?.name || undefined
  }

  get pace () {
    if (!_.isNumber(this.time)) return undefined
    if (!this.time) return 0
    return this.time / this.len
  }

  // time based fields require associated point1 & point2
  get delay () { return this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time) }
  get elapsed () { return this.point2 ? this.point2.elapsed : undefined }
  get time () { return this.point1 && this.point2 ? this.point2.time - this.point1.time : undefined }
  get tod () { return this.point2 ? this.point2.tod : undefined }

  // dummy setters, just in case:
  set delay (v) {}
  set pace (v) {}
  set elapsed (v) {}
  set time (v) {}
  set tod (v) {}
}

module.exports = Segment
