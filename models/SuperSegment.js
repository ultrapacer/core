const _ = require('lodash')
const Segment = require('./Segment')
const { list: factors } = require('../factors')

class SuperSegment extends Segment {
  constructor (segments = []) {
    super({})

    this.segments = segments
  }

  get last () {
    // return last segment object
    return this.segments[this.segments.length - 1]
  }

  sum (f) {
    // return sum field "f" of segments
    return this.segments.reduce((v, s) => { return v + s[f] }, 0)
  }

  get end () {
    return this.last.end
  }

  get len () {
    return this.sum('len')
  }

  get gain () {
    return this.sum('gain')
  }

  get loss () {
    return this.sum('loss')
  }

  set grade (v) {
    this._data.grade = v
  }

  get grade () {
    if (!_.isNumber(this._data.grade)) {
      this._data.grade = this.segments.reduce((v, s) => { return v + (s.grade * s.len) }, 0) / this.len
    }
    return this._data.grade
  }

  get time () {
    return this.sum('time')
  }

  get elapsed () {
    return this.last.elapsed
  }

  get actualElapsed () {
    const v = this.last.actualElapsed
    return isNaN(v) ? null : v
  }

  get tod () {
    return this.last.tod
  }

  get waypoint () {
    return this.last.waypoint
  }

  get factors () {
    const obj = {}
    factors.forEach(f => {
      const v = this.segments.reduce((v, s) => { return v + s.len * s.factors[f] }, 0)
      if (!isNaN(v)) obj[f] = v / this.len
    })
    return obj
  }
}
module.exports = SuperSegment
