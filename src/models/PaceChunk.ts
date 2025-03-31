import _ from 'lodash'
import { vsprintf } from 'sprintf-js'

import type { Types } from '..'
import { createDebug } from '../debug'
import { Factors, generatePlanFactors } from '../factors'
import { req } from '../util/math'

const d = createDebug('PaceChunk')

class PacingTests implements Types.PacingTests {
  points: boolean = false
  iterations: boolean = false
  factor: boolean = false
  target: boolean = false

  get passing() {
    return this.iterations && this.factor && this.target && this.points
  }
}

export class PaceChunk implements Types.PaceChunk {
  constraints: (number | (() => number))[]

  constructor(
    plan: Types.Plan,
    points: Types.PlanPoint[],
    constraints: (number | (() => number))[],
    delay: number
  ) {
    this.constraints = constraints
    this.points = points
    this.plan = plan
    this.delay = delay

    this.factor = 1 // initial value
  }

  points: Types.PlanPoint[]
  plan: Types.Plan
  delay: number

  factor: number

  factors: Factors = new Factors()
  status?: Types.PaceChunk['status'] | undefined

  get elapsed() {
    const a = _.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0]
    const b = _.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]
    return b - a
  }

  get dist() {
    return this.points[this.points.length - 1].loc - this.points[0].loc
  }

  get pace() {
    return (this.elapsed - this.delay) / this.dist
  }

  get np() {
    return this.pace / this.factor
  }

  get moving() {
    return this.elapsed - this.delay
  }

  /**
   * apply pacing to chunk points, update factors
   */
  applyPacing() {
    this.plan.pacing.clearFactor()

    const p = this.points

    // set values for initial point
    p[0].elapsed = _.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0]
    p[0].time =
      p[0].elapsed -
      _.sum(this.plan.pacing.chunks.filter((c) => c.points[0].loc < p[0].loc).map((c) => c.delay))
    if (this.plan.event.start) p[0].tod = this.plan.event.elapsedToTimeOfDay(p[0].elapsed)

    // calculate course normalizing factor:
    let elapsed = p[0].elapsed

    // variables & function for adding in delays:
    let delay = p[0].delay || 0

    let dloc = 0
    let dtime = 0
    let factorSum = 0

    // initially we dont have a factor so use pace instead of np
    const np = this.factor ? this.np : this.plan.pacing.pace

    const factorsSum = new Factors().init(0)

    for (let j = 1, jl = p.length; j < jl; j++) {
      dloc = p[j].loc - p[j - 1].loc
      // determine pacing factor for point
      generatePlanFactors(p[j - 1], this.plan)

      // add to factors total
      factorsSum.applyEach((v, b) => v + b * dloc, p[j - 1].factors)
      const combined = p[j - 1].factors.combined
      factorSum += combined * dloc
      dtime = np * combined * dloc

      p[j].time = p[j - 1].time + dtime
      delay = p[j - 1].delay || 0
      elapsed += dtime + delay
      p[j].elapsed = elapsed
      if (this.plan.event.start) p[j].tod = this.plan.event.elapsedToTimeOfDay(elapsed)
    }
    // add factors to that last point
    generatePlanFactors(p[p.length - 1], this.plan)

    // normalize factors total:
    this.factors = factorsSum.scaleEach(1 / this.dist)
    this.factor = factorSum / this.dist
  }

  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const minIterations = 2
    const maxIterations = 30
    const d2 = d.extend(
      vsprintf('calculate:%.2f-%.2f', [this.points[0].loc, this.points[this.points.length - 1].loc])
    )
    let lastFactor = this.factor || 0
    let lastElapsed: number[] | undefined = undefined
    let i
    const tests = new PacingTests()

    for (i = 1; i <= maxIterations; i++) {
      this.applyPacing()

      tests.iterations = i >= minIterations

      // factor test
      // probably tighter than needed, what is a meaningful threshold for factor change?
      // allow a little more error in the last iteration
      tests.factor = !_.round(lastFactor - this.factor, i === maxIterations ? 6 : 8)
      lastFactor = this.factor

      // tests.target makes sure the final point is within a half second of target time (or cutoff max)
      tests.target =
        Math.abs(
          (_.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) -
            this.points[this.points.length - 1].elapsed
        ) < 0.1

      // tests.points makes sure all points are within a half second of previous iteration
      tests.points =
        (lastElapsed && this.points.every((p, j) => req(p.elapsed, lastElapsed![j], 0))) || false
      lastElapsed = this.points.map((p) => p.elapsed)

      if (tests.passing) {
        d2(`iteration ${i} complete, passed`)
        break
      } else
        d2(
          `iteration ${i} complete, failed ${Object.keys(tests)
            .filter((k) => !tests[k as keyof PacingTests])
            .join('|')}`
        )
    }
    d2('chunk complete')

    const errorMessage = tests.passing
      ? undefined
      : `failed tests ${Object.keys(tests)
          .filter((k) => !tests[k as keyof PacingTests])
          .map((k) => `"${k}"`)
          .join(',')} after ${i} iterations`

    this.status = {
      errorMessage,
      tests,
      success: tests.passing,
      iterations: i
    }
  }
}
