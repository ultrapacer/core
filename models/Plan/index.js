const _ = require('lodash')
const { req, rgte, interp } = require('../../util/math')
const Event = require('../Event')
const { calcPacing, createSegments, createSplits } = require('../../geo')
const areSame = require('../../util/areSame')
const Segment = require('../Segment')
const Pacing = require('../Pacing')
const { list: fKeys, generate: generateFactors, Strategy, Factors } = require('../../factors')
const Meter = require('../../util/Meter')
const validateCache = require('./validateCache')

function getDelayAtWaypoint (delays, waypoint, typ) {
  // return delay object if it exists
  const delay = delays.find(d => areSame(d._waypoint, waypoint.site) && d.loop === waypoint.loop)
  if (delay !== null && delay !== undefined) return delay

  // if not, create a new one, add it to delays, and return it
  const newDelay = { _waypoint: waypoint.site._id, loop: waypoint.loop, delay: waypoint.hasTypicalDelay ? typ : 0 }
  return newDelay
}

class Deferred {
  constructor () {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

// plan constructor will pass through all fields; use
// this array to omit certain keys from passing through
const disallowed = ['cache']

const planPointFields = ['lat', 'lon', 'alt', 'latlon', 'grade', 'loc', 'actual']
class PlanPoint {
  constructor (plan, point) {
    Object.defineProperty(this, '_plan', { value: plan })
    Object.defineProperty(this, '_point', { value: point }) // should be CoursePoint object
    planPointFields.forEach(f => {
      Object.defineProperty(this, f, { get () { return this._point[f] } })
    })
  }

  has (field) {
    return _.isNumber(this[field])
  }

  get pace () {
    const factors = this.factors?.combined
    const np = this._plan.pacing?.np

    if (factors && np) return factors * np

    // if no factors, undefined (this will be the case for last point)
    return undefined
  }
}

class Plan {
  constructor (db) {
    Object.defineProperty(this, '__class', { value: 'Plan' })

    Object.defineProperty(this, '_data', { value: {} })

    Object.defineProperty(this, '_promises', { value: { points: new Deferred() } })
    Object.defineProperty(this, '_ready', { value: { points: this._promises.points.promise } })

    Object.defineProperty(this, 'points', { writable: true })

    this.db = db
    this.course = db.course
    // other fields just pass along:
    Object.keys(db).forEach(k => {
      if (this[k] === undefined && !disallowed.includes(k)) this[k] = db[k]
    })

    // force strategy field to be Strategy class:
    Object.defineProperty(this, 'strategy', {
      get () { return this._data?.strategy },
      set (v) { this._data.strategy = new Strategy({ values: v, length: this.course.dist }) },
      enumerable: true
    })
    if (db.strategy) this.strategy = db.strategy

    // create event property:
    if (db.eventStart) {
      this.event = new Event(this.course.event)
      this.event.timezone = db.eventTimezone
      this.event.start = db.eventStart
    } else {
      this.event = this.course.event
    }

    // create plan heat model
    if (this.event?.start && this.heatModel) {
      Object.assign(this.heatModel, {
        start: this.event.sun.sunrise + 1800,
        stop: this.event.sun.sunset + 3600
      })
    } else {
      this.heatModel = null
    }

    // create delays array
    this.delays = this.course.waypoints
      .map(wp =>
        new PlanDelay({
          waypoint: wp,
          delay: getDelayAtWaypoint(db.delays || [], wp, this.waypointDelay).delay
        })
      )
      .filter(d => d.delay > 0)
      .sort((a, b) => a.loc - b.loc)

    // create notes array
    this.notes = []
    if (db.notes) {
      this.notes = this.course.waypoints
        .map(wp => {
          const note = db.notes.find(n => areSame(n._waypoint, wp.site) && n.loop === wp.loop)?.text || ''
          return {
            waypoint: wp,
            text: note
          }
        })
        .filter(n => n.text)
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

  get totalDelay () {
    return this.delays.reduce((v, d) => { return v + d.delay }, 0)
  }

  get delay () {
    return this.totalDelay
  }

  getDelayAtWaypoint (waypoint) {
    return this.delays.find(d => d.waypoint === waypoint)?.delay || 0
  }

  getTypicalDelayAtWaypoint (waypoint) {
    if (waypoint.hasTypicalDelay) return this.waypointDelay
    return 0
  }

  getNoteAtWaypoint (waypoint) {
    return this.notes.find(d => d.waypoint === waypoint)?.text || ''
  }

  // iterate pacing routine and set this.pacing key
  async calcPacing (options) {
    this.pacing.isValid = false
    this.splits = null
    this.pacing = await calcPacing({
      plan: this,
      options
    })
    this.pacing.isValid = true
  }

  // calculate and return splits for plan
  async calcSplits (type = 'segments') {
    let splits
    if (type === 'segments') splits = await createSegments({ plan: this })
    else if (['kilometers', 'miles'].includes(type)) splits = await createSplits({ unit: type, plan: this })
    else throw new Error('Invalid split type.')

    if (!this.splits) this.splits = {}
    this.splits[type] = splits
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

  async initializePoints () {
    const meter = new Meter()
    const array = []
    // due to large arrays, meter mapping of points
    for (let i = 0; i < this.course.points.length; i++) {
      array.push(new PlanPoint(this, this.course.points[i]))
      await meter.go()
    }
    this.points = array
  }

  async applyPacing (arg = {}) {
    /*
     applyPacing adds time data
     mutates this.course.points

     returns result object: {
       factors: Object w/ overall factor values
       factor: overall pacing factor
     }
    */
    const meter = new Meter()
    if (!this.course?.points?.length) return

    if (!this.points?.length) await this.initializePoints()

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
      if (!delays.length) { return 0 }
      while (delays.length && delays[0].loc < a) {
        delays.shift()
      }
      if (delays.length && delays[0].loc < b) {
        return delays[0].delay
      }
      return 0
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
      await meter.go()
    }

    this._promises.points.resolve(true)

    // normalize factors total:
    const factors = new Factors(Object.fromEntries(fKeys.map(k => [k, factorsSum[k] / this.course.dist])))
    const factor = factorSum / this.course.dist

    return { factor, factors }
  }

  updateDelay (waypoint, delay) {
    let wpd = this.delays.find(d => d.waypoint === waypoint)
    if (wpd) {
      if (delay) {
        wpd.delay = delay
      } else {
        this.delays.splice(this.delays.findIndex(d => d === wpd), 1)
      }
    } else {
      wpd = new PlanDelay({
        waypoint,
        delay
      })
      this.delays.push(wpd)

      this.delays = this.delays
        .filter(d => d.delay > 0)
        .sort((a, b) => a.loc - b.loc)
    }
    return wpd
  }

  updateNote (waypoint, text) {
    let wpn = this.notes.find(d => d.waypoint === waypoint)
    if (wpn) {
      if (text) {
        wpn.text = text
      } else {
        this.notes.splice(this.notes.findIndex(d => d === wpn), 1)
      }
    } else {
      wpn = {
        waypoint,
        text
      }
      this.notes.push(wpn)

      this.notes = this.notes
        .filter(d => d.text?.length)
        .sort((a, b) => a.loc - b.loc)
    }
    return wpn
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
