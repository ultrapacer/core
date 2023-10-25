import _ from 'lodash'
import { Segment } from './Segment.js'
import { list as factorsList } from '../factors/list.js'

export class SuperSegment extends Segment {
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

  /**
   * Return sum of a field
   * @param {String}  field   Field to sum
   * @return {Number}         The sum
   */
  sum(field) {
    // first check that field is numeric for all segments:
    if (this.segments.find((s) => !_.isNumber(s[field]))) return undefined

    // return sum of field
    return _.sumBy(this.segments, field)
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
    return this.last.actualElapsed
  }

  get actualTime() {
    return this.sum('actualTime')
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
    factorsList.forEach((f) => {
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
