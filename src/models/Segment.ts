import type { Types } from '..'
import { rollup } from '../factors'
import { isNumber } from '../util/isNumber'

/**
 * create Factors for segment for points between point1 and point2
 * @param points - course or plan points array
 * @param point1 - start point
 * @param point2 - finish point
 * @returns Factors
 */
function rollupPointFactors(
  points: Types.PlanPoint[],
  point1: Types.PlanPoint,
  point2: Types.PlanPoint
): Types.Factors {
  // points may not be in points array, so insert them if they are interpolated points:
  points = [...points]
  if (point1.interpolated) points.splice(points.findIndex((p) => p.loc > point1.loc) - 1, 0, point1)
  if (point2.interpolated) points.splice(points.findIndex((p) => p.loc > point2.loc) - 1, 0, point2)

  const filteredPoints = points.filter(
    (_p, i) =>
      i >= points.findIndex((p) => p === point1) && i <= points.findIndex((p) => p === point2)
  )

  const segs = filteredPoints.map((p, i) => ({
    factors: p.factors,
    dist: i === filteredPoints.length - 1 ? 0 : filteredPoints[i + 1].loc - filteredPoints[i].loc
  }))
  segs.pop()

  return rollup(segs)
}

class Segment implements Types.Segment {
  constructor(obj: {
    point1: Types.CoursePoint | Types.PlanPoint
    point2: Types.CoursePoint | Types.PlanPoint
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

  point1: Types.CoursePoint | Types.PlanPoint
  point2: Types.CoursePoint | Types.PlanPoint

  gain: number

  loss: number

  grade: number

  waypoint?: Types.Waypoint

  private _name?: string
  get name() {
    return this._name || this.waypoint?.name || undefined
  }

  get start() {
    return this.point1.loc
  }

  get dist() {
    return this.point2.loc - this.point1.loc
  }

  get end() {
    return this.point2.loc
  }

  get alt() {
    return this.point2.alt
  }
}

export class CourseSegment extends Segment implements Types.CourseSegment {
  declare point1: Types.CoursePoint
  declare point2: Types.CoursePoint

  constructor(
    _course: Types.Course,
    obj: {
      point1: Types.CoursePoint
      point2: Types.CoursePoint
      gain: number
      loss: number
      grade: number
    }
  ) {
    super(obj)
    this.point1 = obj.point1
    this.point2 = obj.point2
  }
}

export class PlanSegment extends Segment implements Types.PlanSegment {
  private _plan: Types.Plan

  declare point1: Types.PlanPoint
  declare point2: Types.PlanPoint

  constructor(
    plan: Types.Plan,
    obj: {
      point1: Types.PlanPoint
      point2: Types.PlanPoint
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
    if (!this.time) return 0
    return this.time / this.dist
  }

  get delay() {
    if (
      !isNumber(this.point1.elapsed) ||
      !isNumber(this.point2.elapsed) ||
      !isNumber(this.point1.time) ||
      !isNumber(this.point2.time)
    )
      return 0
    return this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time)
  }

  get elapsed() {
    return this.point2.elapsed
  }

  get time() {
    return this.point2.time - this.point1.time
  }

  get tod() {
    return this.point2.tod
  }

  // dummy setters, just in case:
  set delay(_v) {}
  set pace(_v) {}
  set elapsed(_v) {}
  set time(_v) {}
  set tod(_v) {}

  private _factors?: Types.Factors
  get factors() {
    return (
      this._factors ||
      (this._factors = rollupPointFactors(this._plan.points, this.point1, this.point2))
    )
  }
}
