import { Factors } from '../factors'
import { CoursePoint } from './CoursePoint'
import { PaceChunk } from './PaceChunk'
import { Plan } from './Plan'

export class PlanPoint {
  factors: Factors = new Factors()

  constructor(plan: Plan, point: CoursePoint) {
    this._plan = plan
    this._point = point

    this.time = 0
    this.elapsed = 0
    this.tod = 0
    this.delay = 0
  }

  _chunk?: PaceChunk

  _plan: Plan
  _point: CoursePoint
  elapsed: number
  time: number
  tod: number
  delay: number

  get lat() {
    return this._point.lat
  }
  get lon() {
    return this._point.lon
  }
  get alt() {
    return this._point.alt
  }
  get latlon() {
    return this._point.latlon
  }
  get grade() {
    return this._point.grade
  }
  get loc() {
    return this._point.loc
  }

  /**
   * np for a point is the same as its parent chunk
   */
  get np() {
    if (!this._chunk) throw new Error('PlanPoint._chunk not defined')
    return this._chunk?.np
  }

  get factor() {
    return this.factors?.combined
  }

  get pace() {
    return this.np * this.factor
  }
}
