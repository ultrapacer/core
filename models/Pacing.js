import _ from 'lodash'
import { req } from '../util/math.js'
import { Factors, Strategy } from '../factors/index.js'
import { createDebug } from '../util/index.js'

const d = createDebug('models:Pacing')

export class Pacing {
  constructor(data = {}) {
    Object.defineProperty(this, '_cache', { value: {} })
    Object.defineProperty(this, '_data', { value: {} })
    Object.defineProperty(this, 'status', { value: {}, writable: true, enumerable: true })
    this.isValid = false

    // force strategy field to be Strategy class:
    Object.defineProperty(this, 'strategy', {
      get() {
        return this._data?.strategy
      },
      set(v) {
        this.clearCache()
        this._data.strategy = new Strategy(v)
      },
      enumerable: true
    })

    // force factors field to be Factors class:
    Object.defineProperty(this, 'factors', {
      get() {
        return this._data?.factors
      },
      set(v) {
        this.clearCache()
        this._data.factors = new Factors(v)
      },
      enumerable: true
    })

    Object.assign(this, data)

    // copy strategy from plan or default
    if (!this.strategy) {
      this.strategy = new Strategy(this.plan.strategy || { length: this.plan.course.dist })
    }
  }

  get __class() {
    return 'Pacing'
  }

  clearCache() {
    Object.keys(this._cache).forEach((k) => {
      delete this._cache[k]
    })
  }

  get elapsed() {
    if (this._cache.elapsed) return this._cache.elapsed

    let val, pace, np
    switch (this.plan.pacingMethod) {
      case 'time':
        val = this.plan.pacingTarget
        break
      case 'pace':
        pace = this.plan.pacingTarget
        val = pace * this.plan.course.dist + this.plan.delay
        break
      case 'np':
        np = this.plan.pacingTarget
        pace = np * (this.factor || 1)
        val = pace * this.plan.course.dist + this.plan.delay
        break
      default:
        throw new Error(`Incorrect pacing method ${this.plan.pacingMethod}`)
    }

    // if the last cutoff is the end; reduce elapsed
    const lastCutoff = _.last(this.plan.cutoffs)
    if (lastCutoff && req(lastCutoff.loc, this.plan.course.dist, 4)) {
      val = Math.min(lastCutoff.time, val)
    }

    this._cache.elapsed = val

    return val
  }

  set elapsed(v) {
    d('dummy: set elapsed')
  }

  get pace() {
    return (this.elapsed - this.plan.delay) / this.plan.course.dist
  }

  get np() {
    return this.pace / this.factor
  }

  get moving() {
    return this.elapsed - this.delay
  }

  get delay() {
    return this.plan.delay
  }
}
