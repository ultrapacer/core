const math = require('../util/math')
const { list: factors } = require('../factors')

class Segment {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  get name () {
    return this.waypoint ? this.waypoint.name : ''
  }

  get pace () {
    return this.time / this.len
  }

  // time based fields require associated point1 & point2
  get elapsed () { return this.point2.elapsed }
  get time () { return this.point2.time - this.point1.time }
  get tod () { return this.point2.tod }
}

// SuperSegment class contains multiple segments
class SuperSegment {
  constructor (segments = []) {
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

  get name () {
    return this.last.waypoint.name
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

  get time () {
    return this.sum('time')
  }

  get pace () {
    return this.time / this.len
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
    return factors.map(f => {
      const v = this.segments.reduce((v, s) => { return v + s.len * s.factors[f] }, 0)

      return {
        name: f,
        value: v / this.len
      }
    }).filter(f => math.round(f.value, 4) !== 1)
  }
}

exports.Segment = Segment
exports.SuperSegment = SuperSegment
