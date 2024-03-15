import _ from 'lodash'

import { Factors } from '../factors'
import { rollupFactors } from '../factors/Factors'
import { Plan } from '.'
import { Course } from './Course'
import { CoursePoint } from './CoursePoint'
import { PlanPoint } from './PlanPoint'
import { Waypoint } from './Waypoint'

/**
 * create Factors for segment for points between point1 and point2
 * @param points - course or plan points array
 * @param point1 - start point
 * @param point2 - finish point
 * @returns Factors
 */
function rollupPointFactors(
  points: CoursePoint[] | PlanPoint[],
  point1: CoursePoint | PlanPoint,
  point2: CoursePoint | PlanPoint
): Factors {
  const filteredPoints = points.filter(
    (p, i) =>
      i >= points.findIndex((p) => p === point1) && i <= points.findIndex((p) => p === point2)
  )

  const segs = filteredPoints.map((p, i) => ({
    factors: p.factors,
    dist: i === filteredPoints.length - 1 ? 0 : filteredPoints[i + 1].loc - filteredPoints[i].loc
  }))
  segs.pop()

  return rollupFactors(segs)
}

class Segment {
  constructor(obj: {
    point1: CoursePoint | PlanPoint
    point2: CoursePoint | PlanPoint
    gain: number
    loss: number
    grade: number
    name?: string
  }) {
    this.point1 = obj.point1
    this.point2 = obj.point2
    this.gain = obj.gain
    this.loss = obj.loss
    this.grade = obj.grade
    if (obj.name) this._name = obj.name
  }

  point1: CoursePoint | PlanPoint
  point2: CoursePoint | PlanPoint

  gain: number
  loss: number
  grade: number
  waypoint?: Waypoint

  private _name?: string
  get name() {
    return this._name || this.waypoint?.name || undefined
  }

  get start() {
    return this.point1.loc
  }

  get len() {
    return this.point2.loc - this.point1.loc
  }

  get dist() {
    return this.len
  }

  get end() {
    return this.point2.loc
  }

  get alt() {
    return this.point2.alt
  }
}

export class CourseSegment extends Segment {
  private _course: Course

  point1: CoursePoint
  point2: CoursePoint

  constructor(
    course: Course,
    obj: {
      point1: CoursePoint
      point2: CoursePoint
      gain: number
      loss: number
      grade: number
    }
  ) {
    super(obj)
    this._course = course
    this.point1 = obj.point1
    this.point2 = obj.point2
  }

  private _factors?: Factors
  get factors() {
    return (
      this._factors ||
      (this._factors = rollupPointFactors(this._course.points, this.point1, this.point2))
    )
  }
}

export class PlanSegment extends Segment {
  private _plan: Plan

  point1: PlanPoint
  point2: PlanPoint

  constructor(
    plan: Plan,
    obj: {
      point1: PlanPoint
      point2: PlanPoint
      gain: number
      loss: number
      grade: number
    }
  ) {
    super(obj)
    this._plan = plan
    this.point1 = obj.point1
    this.point2 = obj.point2
  }

  get pace() {
    if (!_.isNumber(this.time)) return undefined
    if (!this.time) return 0
    return this.time / this.len
  }

  // time based fields require associated point1 & point2
  get delay() {
    if (
      !_.isNumber(this.point1.elapsed) ||
      !_.isNumber(this.point2.elapsed) ||
      !_.isNumber(this.point1.time) ||
      !_.isNumber(this.point2.time)
    )
      return undefined
    return this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time)
  }

  get elapsed() {
    return this.point2.elapsed
  }

  get time() {
    if (!_.isNumber(this.point1.time) || !_.isNumber(this.point2.time)) return undefined
    return this.point2.time - this.point1.time
  }

  get tod() {
    return this.point2.tod
  }

  // dummy setters, just in case:
  set delay(v) {}
  set pace(v) {}
  set elapsed(v) {}
  set time(v) {}
  set tod(v) {}

  private _factors?: Factors
  get factors() {
    return (
      this._factors ||
      (this._factors = rollupPointFactors(this._plan.points, this.point1, this.point2))
    )
  }
}
