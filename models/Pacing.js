const _ = require('lodash')
const { req } = require('../util/math')
const { Factors, Strategy } = require('../factors')
const debug = require('../debug')('models:Pacing')

class Pacing {
  constructor (data = {}) {
    Object.defineProperty(this, '_cache', { value: {} })
    Object.defineProperty(this, '_data', { value: {} })
    this.isValid = false

    // force strategy field to be Strategy class:
    Object.defineProperty(this, 'strategy', {
      get () { return this._data?.strategy },
      set (v) {
        this.clearCache()
        this._data.strategy = new Strategy(v)
      },
      enumerable: true
    })

    // force factors field to be Factors class:
    Object.defineProperty(this, 'factors', {
      get () { return this._data?.factors },
      set (v) {
        this.clearCache()
        this._data.factors = new Factors(v)
      },
      enumerable: true
    })

    Object.assign(this, data)

    // copy strategy from plan or default
    if (!this.strategy) {
      this.strategy = new Strategy(this._plan.strategy || { length: this._plan.course.dist })
    }
  }

  clearCache () {
    Object.keys(this._cache).forEach(k => { delete this._cache[k] })
  }

  get elapsed () {
    if (this._cache.elapsed) return this._cache.elapsed

    let val, pace, np
    switch (this._plan.pacingMethod) {
      case 'time':
        val = this._plan.pacingTarget
        break
      case 'pace':
        pace = this._plan.pacingTarget * this._plan.course.distScale
        val = (pace * this._plan.course.dist) + this._plan.delay
        break
      case 'np':
        np = this._plan.pacingTarget * this._plan.course.distScale
        pace = np * (this.factor || 1)
        val = (pace * this._plan.course.dist) + this._plan.delay
        break
      default:
        throw new Error(`Incorrect pacing method ${this._plan.pacingMethod}`)
    }

    // if the last cutoff is the end; reduce elapsed
    const lastCutoff = _.last(this._plan.cutoffs)
    if (lastCutoff && req(lastCutoff.loc, this._plan.course.dist, 4)) {
      val = Math.min(lastCutoff.time, val)
    }

    this._cache.elapsed = val

    return val
  }

  set elapsed (v) { debug('dummy: set elapsed') }

  get pace () {
    return (this.elapsed - this._plan.delay) / this._plan.course.dist
  }

  get np () {
    return this.pace / this.factor
  }

  get moving () {
    return this.elapsed - this.delay
  }

  get delay () {
    return this._plan.delay
  }
}

module.exports = Pacing
