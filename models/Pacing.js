const _last = require('lodash/last')
const { req } = require('../util/math')
const { Factors, Strategy } = require('../factors')

class Pacing {
  constructor (data = {}) {
    Object.defineProperty(this, '_data', { value: {} })
    this.isValid = false

    // force strategy field to be Strategy class:
    Object.defineProperty(this, 'strategy', {
      get () { return this._data?.strategy },
      set (v) { this._data.strategy = new Strategy(v) },
      enumerable: true
    })

    // force factors field to be Factors class:
    Object.defineProperty(this, 'factors', {
      get () { return this._data?.factors },
      set (v) { this._data.factors = new Factors(v) },
      enumerable: true
    })

    Object.keys(data).forEach(k => {
      if (this[k] === undefined) this[k] = data[k]
    })
  }

  get elapsed () {
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
    const lastCutoff = _last(this._plan.cutoffs)
    if (lastCutoff && req(lastCutoff.loc, this._plan.course.dist, 4)) {
      val = Math.min(lastCutoff.time, val)
    }
    return val
  }

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
