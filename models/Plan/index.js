const _ = require('lodash')
const { req, rgte, interp } = require('../../util/math')
const Event = require('../Event')
const { calcPacing, createSegments, createSplits } = require('../../geo')
const areSame = require('../../util/areSame')
const Segment = require('../Segment')
const Pacing = require('../Pacing')
const PlanPoint = require('../PlanPoint')
const { list: fKeys, generate: generateFactors, Strategy, Factors } = require('../../factors')
const validateCache = require('./validateCache')

const areSameWaypoint = (a, b) => (areSame(a.site, b.site) && a.loop === b.loop)

class Plan {
  constructor (db) {
    if (!db.course) throw new Error('Course required')

    // use to store raw input data
    Object.defineProperty(this, 'db', { writable: true })
    Object.defineProperty(this, '_data', { value: db._data || {}, enumerable: true })

    // used to store results of processed information in _data to speed up calcs
    Object.defineProperty(this, '_cache', { value: {} })

    Object.defineProperty(this, 'course', { writable: true })
    Object.defineProperty(this, 'pacing', { writable: true })
    Object.defineProperty(this, 'points', { writable: true })

    this.db = db
    this.course = db.course

    // other fields just pass along:
    // plan constructor will pass through all fields; use
    // this array to omit certain keys from passing through
    const disallowed = ['_data', 'cache']
    if (db._data) disallowed.push('delays')
    Object.keys(db).forEach(k => {
      if (!disallowed.includes(k)) this[k] = db[k]
    })

    // create event property:
    if (db.eventStart) {
      this.event = new Event(this.course.track.start)
      this.event.timezone = db.eventTimezone
      this.event.start = db.eventStart
    } else {
      this.event = this.course.event
    }

    // create cutoffs array:
    this.cutoffs = []
    if (this.adjustForCutoffs) {
      this.cutoffs = this.course.cutoffs.map(c => new PlanCutoff({ courseCutoff: c, plan: this }))
    }

    // use cached splits if input:
    this.splits = null
    this.pacing = null
    if (db.cache) {
      // make sure cache has expected data:
      validateCache(db.cache)

      this.pacing = new Pacing({ _plan: this, ...db.cache.pacing })

      // add splits, and make sure each is casted as a Segment
      this.splits = {}
      this.splits.segments = db.cache.segments.map(s => { return new Segment(s) })
      this.splits.segments.forEach(s => { s.factors = new Factors(s.factors) })

      // sync waypoint objects
      if (this.course?.waypoints?.length && this.splits.segments?.length) {
        this.splits.segments.forEach(s => {
          const wp = this.course.waypoints.find(
            wp => areSame(wp.site, s.waypoint.site) && wp.loop === s.waypoint.loop
          )
          if (wp) s.waypoint = wp
        })
      }
      this.pacing.isValid = true
    }

    // if no pacing from cache, create a new pacing object:
    if (!this.pacing) this.pacing = new Pacing({ _plan: this })
  }

  get __class () { return 'Plan' }

  clearCache () {
    Object.keys(this._cache).forEach(key => { delete this._cache[key] })
  }

  get strategy () {
    if (this._cache.strategy) return this._cache.strategy
    this._cache.strategy = new Strategy({ values: this._data.strategy, length: this.course.dist })
    return this._cache.strategy
  }

  set strategy (v) {
    console.warn('this is temporary to sync calcs up between new and old')
    if (Array.isArray(v)) v.forEach(x => { x.onset *= this.course.distScale })

    this._data.strategy = v
    delete this._cache.strategy
  }

  get heatModel () {
    if (this._cache.heatModel !== undefined) return this._cache.heatModel

    if (this._data.heatModel) {
      this._cache.heatModel = Object.assign({
        start: this.event.sun.sunrise + 1800,
        stop: this.event.sun.sunset + 7200

      }, _.pick(this._data.heatModel, ['baseline', 'max']))
    } else {
      this._cache.heatModel = null
    }

    return this._cache.heatModel
  }

  set heatModel (v) {
    this._data.heatModel = v
  }

  get totalDelay () {
    return this.delays.reduce((v, d) => { return v + d.delay }, 0)
  }

  get delays () {
    if (this._cache.delays) return this._cache.delays

    this._cache.delays = this.course.waypoints
      .map(waypoint => {
        const wpd = this._data.delays?.find(d => areSameWaypoint(d.waypoint, waypoint))
        const delay = wpd ? wpd.delay : (waypoint.hasTypicalDelay ? this.waypointDelay : 0)
        return new PlanDelay({ waypoint, delay })
      })
      .filter(d => d.delay > 0)
      .sort((a, b) => a.loc - b.loc)

    return this._cache.delays
  }

  set delays (v) {
    this._data.delays = v
    delete this._cache.delays
  }

  get delay () {
    return this.totalDelay
  }

  get notes () {
    if (this._cache.notes) return this._cache.notes
    this._cache.notes = this._data.notes
      ?.map(wpn => ({
        waypoint: this.course.waypoints.find(waypoint => areSameWaypoint(wpn.waypoint, waypoint)),
        text: wpn.text
      })) || []

    return this._cache.notes
  }

  set notes (v) {
    this._data.notes = v
    delete this._cache.notes
  }

  getDelayAtWaypoint (waypoint) {
    return this.delays.find(d => areSameWaypoint(d.waypoint, waypoint))?.delay || 0
  }

  getTypicalDelayAtWaypoint (waypoint) {
    if (waypoint.hasTypicalDelay) return this.waypointDelay
    return 0
  }

  getNoteAtWaypoint (waypoint) {
    return this.notes.find(d => areSameWaypoint(d.waypoint, waypoint))?.text || ''
  }

  // iterate pacing routine and set this.pacing key
  calcPacing () {
    this.splits = null

    let time = new Date().getTime()

    // calcPacing mutates this.pacing
    calcPacing({
      plan: this,
      options: {
        testLocations: this.course.waypoints.map(wp => wp.loc)
      }
    })

    time = new Date().getTime() - time
    console.debug(`Plan.calcPacing: complete after ${this.pacing.status.iterations} iterations (${time} ms).`)
    this.pacing.isValid = true
  }

  // calculate and return splits for plan
  calcSplits (type = 'segments') {
    this.checkPacing()
    let splits
    if (type === 'segments') splits = createSegments({ plan: this })
    else if (['kilometers', 'miles'].includes(type)) splits = createSplits({ unit: type, plan: this })
    else throw new Error('Invalid split type.')

    if (!this.splits) this.splits = {}
    this.splits[type] = splits

    return splits
  }

  getPoint ({ loc, insert = false }) {
    // get and return it if already exists
    const i2 = this.points.findIndex(p => rgte(p.loc, loc, 4))
    const p2 = this.points[i2]

    // if point exists, return it
    if (req(p2.loc, loc, 4)) return p2

    // define first point for interpolation
    const i1 = i2 - 1
    const p1 = this.points[i1]

    // create a new point
    const point = new PlanPoint(this, this.course.getPoint({ loc, insert }))

    // add in interpolated time values if they exist
    if (!isNaN(p1.time) && !isNaN(p2.time)) {
      const delay = (p2.elapsed - p2.time) - (p1.elapsed - p1.time)
      point.time = interp(p1.loc, p2.loc, p1.time + delay, p2.time, p2.loc)
      point.elapsed = p2.elapsed - (p2.time - point.time)
      if (_.isNumber(this.event.startTime)) {
        point.tod = (this.event.startTime + point.elapsed) % 86400
      }
    }

    if (insert) this.points.splice(i2, 0, point)

    return point
  }

  initializePoints () {
    const array = []
    // due to large arrays, meter mapping of points
    for (let i = 0; i < this.course.points.length; i++) {
      array.push(new PlanPoint(this, this.course.points[i]))
    }
    this.points = array
  }

  applyPacing (arg = {}) {
    /*
     applyPacing adds time data
     mutates this.course.points

     returns result object: {
       factors: Object w/ overall factor values
       factor: overall pacing factor
     }
    */
    if (!this.course?.points?.length) return

    if (!this.points?.length) this.initializePoints()

    const options = {
      addBreaks: true
    }
    Object.assign(options, arg)

    if (options.addBreaks) {
      this.course.terrainFactors?.forEach(tf => this.getPoint({ loc: tf.start, insert: true }))
      this.delays?.forEach(d => this.getPoint({ loc: d.loc, insert: true }))
    }

    // calculate course normalizing factor:
    const p = this.points
    let elapsed = 0
    p[0].elapsed = 0
    p[0].time = 0
    if (this.event.start) {
      p[0].tod = this.event.startTime
    }

    // variables & function for adding in delays:
    let delay = 0
    const delays = [...this.delays]
    function getDelay (a, b) {
      let d = 0
      if (!delays.length) { return d }
      while (delays.length && delays[0].loc < a) {
        delays.shift()
      }
      while (delays.length && delays[0].loc < b) {
        d += delays[0].delay
        delays.shift()
      }
      return d
    }
    let dloc = 0
    let dtime = 0
    let factorSum = 0

    // initially we dont have a factor so use pace instead of np
    const np = this.pacing.factor ? this.pacing.np : this.pacing.pace

    const factorsSum = Object.fromEntries(fKeys.map(k => [k, 0]))

    for (let j = 1, jl = p.length; j < jl; j++) {
      dloc = p[j].loc - p[j - 1].loc
      // determine pacing factor for point
      generateFactors(p[j - 1], { plan: this })

      // add to factors total
      fKeys.forEach(k => { factorsSum[k] += p[j - 1].factors[k] * dloc })
      const combined = p[j - 1].factors.combined
      factorSum += combined * dloc
      dtime = np * combined * dloc

      p[j].time = p[j - 1].time + dtime
      delay = getDelay(p[j - 1].loc, p[j].loc)
      elapsed += dtime + delay
      p[j].elapsed = elapsed
      if (this.event.start) p[j].tod = (elapsed + this.event.startTime) % 86400
    }
    // add factors to that last point
    generateFactors(_.last(p), { plan: this })

    // normalize factors total:
    const factors = new Factors(Object.fromEntries(fKeys.map(k => [k, factorsSum[k] / this.course.dist])))
    const factor = factorSum / this.course.dist

    return { factor, factors }
  }

  update (field, val) {
    switch (field) {
      case 'delays': {
        this._data.delays = val
        delete this._cache.delays

        // pacing now invalid
        this.invalidatePacing()

        break
      }
      case 'delay': {
        let { delay, waypoint } = val

        // get course waypoint
        waypoint = this.course.waypoints.find(wp => areSameWaypoint(wp, waypoint))
        if (!waypoint) throw new Error('unknown waypoint')

        // find existing index
        const i = this._data.delays.findIndex(d => areSameWaypoint(d.waypoint, waypoint))

        // if the delay is a non-typical value, update/push it to the _data.delays array:
        if (delay !== this.getTypicalDelayAtWaypoint(waypoint)) {
          if (i >= 0) this._data.delays[i] = { waypoint, delay }
          else this._data.delays.push({ waypoint, delay })

        // otherwise if is typical, remove it from the _data.delays array
        } else if (i >= 0) {
          this._data.delays.splice(i, 1)
        }

        // clear _cache.delays
        delete this._cache.delays

        // pacing now invalid
        this.invalidatePacing()

        break
      }
      case 'note': {
        let { text, waypoint } = val

        // get course waypoint
        waypoint = this.course.waypoints.find(wp => areSameWaypoint(wp, waypoint))
        if (!waypoint) throw new Error('unknown waypoint')

        // find existing index
        const i = this._data.notes.findIndex(d => areSameWaypoint(d.waypoint, waypoint))

        // if the text is truthy value, update/push it to the _data.notes array:
        if (text) {
          if (i >= 0) this._data.notes[i] = { waypoint, text }
          else this._data.notes.push({ waypoint, text })

        // otherwise if is typical, remove it from the _data.delays array
        } else if (i >= 0) {
          this._data.notes.splice(i, 1)
        }

        // clear _cache.delays
        delete this._cache.notes

        break
      }
    }
  }

  invalidatePacing () {
    console.log('invalidatePacing')
    this.pacing.isValid = false
    this.splits = null
  }

  checkPacing () {
    if (!this.pacing?.isValid) this.calcPacing()
    if (!this.points?.length) this.applyPacing()
    return true
  }
}

class PlanDelay {
  constructor (data) {
    Object.assign(this, data)
  }

  get loc () { return this.waypoint.loc }
}

class PlanCutoff {
  constructor (data) {
    Object.assign(this, data)
  }

  get waypoint () { return this.courseCutoff.waypoint }
  get loc () { return this.courseCutoff.loc }
  get time () { return this.courseCutoff.time - Math.max((this.plan.cutoffMargin || 0), this.plan.getDelayAtWaypoint(this.waypoint)) }
}

module.exports = Plan
