import { Factors } from '../factors/Factors'
import { Course } from './Course'
import { TrackPoint } from './Point'

export class CoursePoint {
  factors: Factors = new Factors()

  constructor(course: Course, point: TrackPoint, loop: number) {
    Object.defineProperty(this, 'course', { writable: true })

    this.point = point
    this.course = course
    this.loop = loop
  }

  point: TrackPoint
  course: Course
  loop: number

  get lat(): number {
    return this.point.lat
  }
  get lon(): number {
    return this.point.lon
  }
  get alt(): number {
    return this.point.alt
  }
  get latlon() {
    return this.point.latlon
  }

  get grade(): number {
    return this.point.grade * (this.point.grade > 0 ? this.course.gainScale : this.course.lossScale)
  }

  get loc(): number {
    let l = this.point.loc * this.course.distScale
    if (this.loop) l += this.course.loopDist * this.loop
    return l
  }
}
