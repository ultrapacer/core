import _ from 'lodash'

import { rollupFactors } from '../factors/Factors'
import { CourseSegment, PlanSegment } from './Segment'

class SuperSegment {
  segments: CourseSegment[] | PlanSegment[]

  constructor(segments: CourseSegment[] | PlanSegment[]) {
    this.segments = segments
  }

  /**
   * Returns first segment in segments array.
   * @returns The first segment in the segments array.
   */
  get first(): CourseSegment | PlanSegment {
    return this.segments[0]
  }

  /**
   * Returns last segment in segments array.
   * @returns The last segment in the segments array.
   */
  get last() {
    // return last segment object
    return this.segments[this.segments.length - 1]
  }

  get start() {
    return this.segments[0].start
  }

  get end() {
    return this.last.end
  }

  get len() {
    return this.last.end - this.first.start
  }

  get gain(): number {
    return _.sum(this.segments.map((s) => s.gain))
  }

  get loss(): number {
    return _.sum(this.segments.map((s) => s.loss))
  }

  get grade() {
    return (
      this.segments.reduce((v, s) => {
        return v + s.grade * s.len
      }, 0) / this.len
    )
  }

  get name() {
    return this.last.name
  }

  get waypoint() {
    return this.last.waypoint
  }

  /**
   * Returns factors for this SuperSegment.
   * @returns The pacing factors for this segment, including overall "combined" factor.
   */
  get factors() {
    return rollupFactors(this.segments)
  }

  /**
   * Returns first point in the SuperSegment.
   * @returns The first point in the SuperSegment.
   */
  get point1() {
    return this.first.point1
  }

  /**
   * Returns last point in the SuperSegment.
   * @returns The last point in the SuperSegment.
   */
  get point2() {
    return this.last.point2
  }
}

export class SuperCourseSegment extends SuperSegment {
  segments: CourseSegment[]
  constructor(segments: CourseSegment[]) {
    super(segments)
    this.segments = segments
  }
}

export class SuperPlanSegment extends SuperSegment {
  segments: PlanSegment[]
  constructor(segments: PlanSegment[]) {
    super(segments)
    this.segments = segments
  }
  get last(): PlanSegment {
    return this.segments[this.segments.length - 1]
  }
  get elapsed() {
    return this.last.elapsed
  }
  get time() {
    return _.sum(this.segments.map((s) => s.time))
  }
  get tod() {
    return this.last.tod
  }
}
