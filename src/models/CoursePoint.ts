import type { Types } from '..'
import { Factors } from '../factors/Factors'
import { TrackPoint } from './Point'

function isCoursePoint(point: Types.TrackPoint | Types.CoursePoint): point is Types.CoursePoint {
  return '_course' in point
}

/**
 * CoursePoint object for use in a course, including scaling and loop data
 */
export class CoursePoint extends TrackPoint implements Types.CoursePoint {
  private _course: Types.Course

  factors: Factors = new Factors()

  get grade(): number {
    // if source is a course point, it is already scaled
    if (isCoursePoint(this.source)) return this.source.grade

    return (
      this.source.grade * (this.source.grade > 0 ? this._course.gainScale : this._course.lossScale)
    )
  }

  get interpolated() {
    return (isCoursePoint(this.source) ? this.source.interpolated : this._interpolated) || false
  }
  set interpolated(value: boolean) {
    this._interpolated = value
  }
  private _interpolated?: boolean

  get loc(): number {
    // if source is a course point, it is already scaled/looped
    if (isCoursePoint(this.source)) return this.source.loc

    let l = this.source.loc * this._course.distScale
    if (this.loop) l += this._course.loopDist * this.loop
    return l
  }

  loop: number

  declare readonly source: Types.TrackPoint | Types.CoursePoint

  constructor(course: Types.Course, point: Types.TrackPoint, loop: number) {
    super(point, point.loc, point.grade)

    this._course = course
    this.loop = loop
    this.source = point
  }
}
