import _ from 'lodash'
import { sprintf } from 'sprintf-js'

import { Factors, list as fKeys } from '../factors/index.js'
import { Callbacks } from '../util/Callbacks.js'
import { createDebug, MissingDataError } from '../util/index.js'
import { PaceChunk } from './PaceChunk.js'

const d = createDebug('Pacing')

export class Pacing {
  constructor(data = {}) {
    Object.defineProperty(this, '_cache', { value: {} })

    this.callbacks = new Callbacks(this, ['onUpdated', 'onFail', 'onInvalidated'])

    Object.assign(this, data)
  }

  get __class() {
    return 'Pacing'
  }

  clearCache() {
    d('clearCache')
    Object.keys(this._cache).forEach((k) => {
      delete this._cache[k]
    })
  }

  invalidate() {
    d('invalidate')

    this.chunks = []
    this.clearCache()

    this.callbacks.execute('onInvalidated')
  }

  get elapsed() {
    d('elapsed:get')
    if (this._cache.elapsed) return this._cache.elapsed
    return _.last(this.plan.points).elapsed
  }

  get pace() {
    d('pace:get')
    return (this.elapsed - this.plan.delay) / this.plan.course.dist
  }

  get factor() {
    if (this._cache.factor) return this._cache.factor

    d('factor:update')

    if (this.chunks)
      this._cache.factor = _.sum(this.chunks.map((c) => c.factor * c.dist)) / this.plan.course.dist

    return this._cache.factor || 1
  }

  get factors() {
    d('factors:get')
    if (!this.chunks) return undefined

    if (!this._cache.factors) {
      d('factors:update')

      // rollup individual factors:
      return new Factors(
        Object.fromEntries(
          fKeys.map((k) => [
            k,
            _.sum(this.chunks.map((c) => c.factors[k] * c.dist)) / this.plan.course.dist
          ])
        )
      )
    }
    return this._cache.factors
  }

  get np() {
    d('np:get')
    return this.pace / this.factor
  }

  get moving() {
    return this.elapsed - this.plan.delay
  }

  get status() {
    return {
      complete: this.chunks?.length > 0,
      success: this.chunks?.filter((c) => !c.status?.success).length === 0,
      chunks: this.chunks?.length || 0
    }
  }

  calculate() {
    const d2 = d.extend('calculate')
    d2('exec')

    if (!this.plan.points?.length) {
      d2('calculate: error; no points')
      throw new MissingDataError('Plan points are not defined.', 'points')
    }

    // clear some cached things
    d2('clearing cache')
    this.clearCache()

    d2('adding points at each terrain factor break')
    this.plan.course.terrainFactors?.forEach((tf) =>
      this.plan.getPoint({ loc: tf.start, insert: true })
    )

    d2('adding points at each cutoff')
    if (this.plan.adjustForCutoffs) {
      this.plan.cutoffs.forEach((c) => {
        c.point = this.plan.getPoint({ loc: c.loc, insert: true })
      })
    }

    // assign delays to points
    this.plan.points
      .filter((p) => p.delay)
      .forEach((p) => {
        delete p.delay
      })
    this.plan.delays?.forEach((d) => {
      const p = this.plan.getPoint({ loc: d.loc, insert: true })
      p.delay = d.delay
    })

    d2('creating pace chunks')
    this.initChunks()

    const cutoffs = _.reverse([...this.plan.cutoffs])
    cutoffs.unshift(null)

    cutoffs.push(null)

    cutoffs.forEach((cutoff) => {
      while (this.chunks.find((c) => !c.status)) {
        this.calcChunks()
        this.validateChunks()
      }

      // now test cutoff
      if (!cutoff) return true
      if (cutoff.point.elapsed - cutoff.time > 0.5) {
        d2(`cutoff at ${cutoff.loc} missed`)
        const chunk = this.chunks[0]
        if (_.last(chunk.points) === cutoff.point) {
          d2(`setting cutoff at ${cutoff.loc}`)
          chunk.constraints = [0, cutoff.time]
          delete chunk.status
        } else {
          this.splitChunk(chunk, { point: cutoff.point, elapsed: cutoff.time })
        }
      }
    })

    // make sure that if are are using a dynamic constraint at the end that it gets updates again
    if (_.isFunction(_.last(this.chunks).constraints[1]) && this.chunks.length > 2) {
      d2('rerunning last chunk')
      _.last(this.chunks).calculate()
    }

    d(`pacing status=${this.status.success ? 'PASS' : 'FAIL'}.`)

    if (this.status.success) this.callbacks.execute('onUpdated')
    else this.callbacks.execute('onFail')
  }

  /**
   * initialize pacing chunks array
   */
  initChunks() {
    let elapsed
    switch (this.plan.pacingMethod) {
      case 'time':
        elapsed = this.plan.pacingTarget
        break
      case 'pace':
        elapsed = this.plan.pacingTarget * this.plan.course.dist + this.plan.delay
        break
      case 'np':
        elapsed = () => {
          return (
            this.plan.pacingTarget * (this.factor || 1) * this.plan.course.dist + this.plan.delay
          )
        }
        break
      default:
        throw new Error(`Incorrect pacing method ${this.plan.pacingMethod}`)
    }

    this.chunks = [
      new PaceChunk({
        plan: this.plan,
        points: this.plan.points,
        constraints: [0, elapsed],
        delay: this.plan.delay
      })
    ]

    // assign the chunk to all points
    this.plan.points.forEach((p) => {
      p._chunk = this.chunks[0]
    })
  }

  /**
   * calculate pacing for each pacing chunk
   */
  calcChunks() {
    d('calcChunks')
    this.clearCache()
    this.chunks.filter((chunk) => !chunk.status).forEach((chunk) => chunk.calculate())
  }

  /**
   * make sure chunks nps increasing monotincally and merge if needed
   */
  validateChunks() {
    let i = 1
    while (i <= this.chunks.length - 1) {
      if (this.chunks[i].np < this.chunks[i - 1].np)
        this.mergeChunks(this.chunks[i - 1], this.chunks[i])
      else i++
    }
  }

  /**
   * split pacing chunk; mutates chunks array
   * @param {*} args
   * @param {PlanPoint} args.point    point to split at
   * @param {Number}    args.elapsed  elapsed time at split
   */
  splitChunk(chunk, { point, elapsed }) {
    const d2 = d.extend('split')

    // need to split chunks
    d2(`breaking chunks at ${point.loc} km`)

    // find index of cutoff point
    const cpi = chunk.points.findIndex((p) => p === point)

    // get delay from start up to cutoff point
    const delay = _.round(point.elapsed - point.time)

    // create new chunk
    const newChunk = new PaceChunk({
      plan: this.plan,
      points: chunk.points.slice(0, cpi + 1),
      constraints: [0, elapsed],
      delay
    })

    // assign the new chunk to all its points
    newChunk.points
      .filter((p, i) => i < newChunk.points.length - 1)
      .forEach((p) => {
        p._chunk = newChunk
      })

    this.chunks.unshift(newChunk)

    // update 2nd portion of chunk:
    // set elapsed lower bound to cutoff time
    chunk.constraints[0] = elapsed
    // remove delay thats part of former chunk
    chunk.delay -= delay
    // slice out latter portion of points
    chunk.points = chunk.points.slice(cpi)
    // clear status
    delete chunk.status
  }

  /**
   * merge two sequential chunks together, mutates chunks array
   * @param {*} a first chunk
   * @param {*} b second chunk
   */
  mergeChunks(a, b) {
    const i = this.chunks.findIndex((c) => c === a)
    const j = this.chunks.findIndex((c) => c === b)

    if (j - i !== 1) throw new Error('chunks must be sequential')

    d(sprintf('calcChunks: merging %i&%i (%.2f&%.2f)', i, j, a.np, b.np))
    a.points.pop()
    a.points.push(...b.points)
    a.delay += b.delay
    delete a.status
    a.points.forEach((p) => {
      p._chunk = a
    })
    a.constraints = [a.constraints[0], b.constraints[1]]
    this.chunks.splice(j, 1)
  }
}
