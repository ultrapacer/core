const _ = require('lodash')
const Segment = require('./Segment')
const { list: factors } = require('../factors')

class SuperSegment extends Segment {
  constructor(segments = []) {
    super({})

    this.segments = segments
  }

  /**
   * Returns first segment in segments array.
   *
   * @return {Segment} The first segment in the segments array.
   */
  get first() {
    return this.segments[0]
  }

  /**
   * Returns last segment in segments array.
   *
   * @return {Segment} The last segment in the segments array.
   */
  get last() {
    // return last segment object
    return _.last(this.segments)
  }

  sum(f) {
    // return sum field "f" of segments
    return this.segments.reduce((v, s) => {
      return v + s[f]
    }, 0)
  }

  get start() {
    return this.segments[0].start
  }

  get end() {
    return this.last.end
  }

  get len() {
    return this.sum('len')
  }

  get gain() {
    return this.sum('gain')
  }

  get loss() {
    return this.sum('loss')
  }

  set grade(v) {
    this._data.grade = v
  }

  get grade() {
    if (!_.isNumber(this._data.grade)) {
      this._data.grade =
        this.segments.reduce((v, s) => {
          return v + s.grade * s.len
        }, 0) / this.len
    }
    return this._data.grade
  }

  get name() {
    return this.last.name
  }

  get time() {
    return this.sum('time')
  }

  get elapsed() {
    return this.last.elapsed
  }

  get actualElapsed() {
    const v = this.last.actualElapsed
    return isNaN(v) ? null : v
  }

  get tod() {
    return this.last.tod
  }

  get waypoint() {
    return this.last.waypoint
  }

  /**
   * Returns factors for this SuperSegment.
   *
   * @return {Object} The pacing factors for this segment, including overall "combined" factor.
   */
  get factors() {
    const obj = { combined: 1 }
    factors.forEach((f) => {
      const v = this.segments.reduce((v, s) => {
        return v + s.len * s.factors[f]
      }, 0)
      if (!isNaN(v)) obj[f] = v / this.len
      obj.combined *= obj[f]
    })
    return obj
  }

  get status() {
    return this.last.status
  }

  /**
   * Returns first point in the SuperSegment.
   *
   * @return {CoursePoint|PlanPoint} The first point in the SuperSegment.
   */
  get point1() {
    return this.first.point1
  }

  /**
   * Returns last point in the SuperSegment.
   *
   * @return {CoursePoint|PlanPoint} The last point in the SuperSegment.
   */
  get point2() {
    return this.last.point2
  }
}
module.exports = SuperSegment
