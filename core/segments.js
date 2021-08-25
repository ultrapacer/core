const math = require('./math')

class Segment {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  name () {
    return this.waypoint ? this.waypoint.name() : ''
  }
}
const factors = ['gF', 'tF', 'aF', 'hF', 'dF', 'dark']

// SuperSegment class contains multiple segments
class SuperSegment {
  constructor (segments = []) {
    this.segments = segments
  }

  last () {
    // return last segment object
    return this.segments[this.segments.length - 1]
  }

  sum (f) {
    // return sum field "f" of segments
    return this.segments.reduce((v, s) => { return v + s[f] }, 0)
  }

  end () {
    return this.last().end
  }

  name () {
    return this.last().waypoint.name()
  }

  len () {
    return this.sum('len')
  }

  gain () {
    return this.sum('gain')
  }

  loss () {
    return this.sum('loss')
  }

  time () {
    return this.sum('time')
  }

  elapsed () {
    return this.last().elapsed
  }

  actualElapsed () {
    const v = this.last().actualElapsed
    return isNaN(v) ? null : v
  }

  tod () {
    return this.last().tod
  }

  factors () {
    return factors.map(f => {
      const v = this.segments.reduce((v, s) => { return v + s.len * s.factors[f] }, 0)
      const t = this.len()

      return {
        name: f,
        value: v / t
      }
    }).filter(f => math.round(f.value, 4) !== 1)
  }
}

exports.Segment = Segment
exports.SuperSegment = SuperSegment
