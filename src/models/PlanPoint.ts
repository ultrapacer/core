import type { Types } from '..'
import { Factors } from '../factors'
import { CoursePoint } from './CoursePoint'

/**
 * PlanPoint object for use in a plan, including pacing and time data
 */
export class PlanPoint extends CoursePoint implements Types.PlanPoint {
  _chunk?: Types.PaceChunk

  delay: number = 0

  elapsed: number = 0

  get factor() {
    return this.factors?.combined
  }

  factors: Factors = new Factors()

  get np() {
    if (!this._chunk) throw new Error('PlanPoint._chunk not defined')
    return this._chunk?.np
  }

  get pace() {
    return this.np * this.factor
  }

  declare source: Types.CoursePoint

  time: number = 0

  tod: number = 0

  constructor(plan: Types.Plan, point: Types.CoursePoint) {
    super(plan.course, point, point.loop)

    this.source = point
  }
}
