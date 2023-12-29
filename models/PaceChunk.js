import _ from 'lodash'
import { vsprintf } from 'sprintf-js'

import { createDebug } from '../debug'
import { Factors, generate as generateFactors, list as fKeys } from '../factors/index.js'

const d = createDebug('PaceChunk')

export class PaceChunk {
  constructor(data = {}) {
    if (!_.has(data, 'points')) throw new Error('"points" required.')
    if (!_.has(data, 'constraints')) throw new Error('"constraints" required.')

    Object.assign(this, data)
  }

  l

  set elapsed(v) {
    this.constraints.elapsed = v
  }
  get elapsed() {
    const b = _.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]
    return b - this.constraints[0]
  }

  get dist() {
    return _.last(this.points).loc - _.first(this.points).loc
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
    delete this.plan.pacing._cache.factor

    const p = this.points

    // set values for initial point
    p[0].elapsed = this.constraints[0]
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

    const factorsSum = Object.fromEntries(fKeys.map((k) => [k, 0]))

    for (let j = 1, jl = p.length; j < jl; j++) {
      dloc = p[j].loc - p[j - 1].loc
      // determine pacing factor for point
      generateFactors(p[j - 1], { plan: this.plan })

      // add to factors total
      fKeys.forEach((k) => {
        factorsSum[k] += p[j - 1].factors[k] * dloc
      })
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
    generateFactors(_.last(p), { plan: this.plan })

    // normalize factors total:
    this.factors = new Factors(Object.fromEntries(fKeys.map((k) => [k, factorsSum[k] / this.dist])))
    this.factor = factorSum / this.dist
  }

  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const minIterations = 2
    const maxIterations = 20
    const d2 = d.extend(
      vsprintf('calculate:%.2f-%.2f', [_.first(this.points).loc, _.last(this.points).loc])
    )
    let lastFactor = this.factor || 0
    let i
    const tests = {}
    let pass = false

    for (i = 0; i < maxIterations; i++) {
      this.applyPacing()

      tests.iterations = i >= minIterations

      tests.factor = !_.round(lastFactor - this.factor, 10)
      lastFactor = this.factor

      // tests.target makes sure the final point is within a half second of target time (or cutoff max)
      tests.target =
        Math.abs(
          (_.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) -
            _.last(this.points).elapsed
        ) < 0.1

      d2(
        vsprintf('%i|%s', [
          i,
          Object.keys(tests)
            .map((k) => vsprintf('%s=%s', [k, tests[k] ? 'P' : 'F']))
            .join('|')
        ])
      )

      pass = !Object.keys(tests).filter((k) => !tests[k]).length

      if (pass) break
    }
    d2('iteration complete')

    this.status = {
      tests,
      success: pass,
      iterations: i + 1
    }
  }
}
