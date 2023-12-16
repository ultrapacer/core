import _ from 'lodash'
import { req, rgte, interp, interpArray } from '../../util/math.js'
import { Event } from '../Event.js'
import { calcPacing, createSegments, createSplits } from '../../geo.js'
import { areSame, createDebug, MissingDataError } from '../../util/index.js'
import { Pacing } from '../Pacing.js'
import { PlanPoint } from '../PlanPoint.js'
import { list as fKeys, generate as generateFactors, Factors } from '../../factors/index.js'
import { Strategy } from '../../factors/strategy/index.js'

const d = createDebug('models:Plan')

const areSameWaypoint = (a, b) => areSame(a.site, b.site) && a.loop === b.loop

class PlanSplits {
  constructor(data) {
    Object.defineProperty(this, '_cache', { value: {} })
    Object.assign(this, data)
  }

  get __class() {
    return 'PlanSplits'
  }

  get segments() {
    if (!this._cache.segments?.length) {
      d('calculating segments')
      this.plan.checkPacing()
      this._cache.segments = createSegments({ plan: this.plan })
    }
    return this._cache.segments
  }

  set segments(v) {
    this._cache.segments = v
  }

  get miles() {
    if (!this._cache.miles?.length) {
      d('calculating miles')
      this.plan.checkPacing()
      this._cache.miles = createSplits({ unit: 'miles', plan: this.plan })
    }
    return this._cache.miles
  }

  set miles(v) {
    this._cache.miles = v
  }

  get kilometers() {
    if (!this._cache.kilometers?.length) {
      d('calculating kilometers')
      this.plan.checkPacing()
      this._cache.kilometers = createSplits({ unit: 'kilometers', plan: this.plan })
    }
    return this._cache.kilometers
  }

  set kilometers(v) {
    this._cache.kilometers = v
  }
}

export class Plan {
  constructor(db) {
    if (!db.course) throw new Error('Course required')

    // use to store raw input data
    Object.defineProperty(this, 'db', { writable: true })

    const _data = db._data || {}

    // assign defaults
    _.defaults(_data, { adjustForCutoffs: true })

    Object.defineProperty(this, '_data', { value: _data, enumerable: true })

    // used to store results of processed information in _data to speed up calcs
    Object.defineProperty(this, '_cache', { value: {} })

    Object.defineProperty(this, 'course', { writable: true })

    this.db = db
    this.course = db.course

    // other fields just pass along:
    // plan constructor will pass through all fields; use
    // this array to omit certain keys from passing through
    const disallowed = ['_data', 'cache']
    if (db._data) disallowed.push('delays')
    Object.keys(db).forEach((k) => {
      if (!disallowed.includes(k)) this[k] = db[k]
    })
  }

  get __class() {
    return 'Plan'
  }

  clearCache() {
    Object.keys(this._cache).forEach((key) => {
      delete this._cache[key]
    })
  }

  set eventStart(v) {
    if (v) this._data.eventStart = new Date(v)
    else delete this._data.eventStart
    delete this._cache.event
  }

  get eventStart() {
    return this._data.eventStart
  }

  set eventTimezone(v) {
    if (v) this._data.eventTimezone = v
    else delete this._data.eventTimezone

    delete this._cache.event
  }

  get eventTimezone() {
    return this._data.eventTimezone
  }

  get event() {
    if (this._cache.event) return this._cache.event

    let start = this.eventStart || this.course.eventStart
    if (!start) {
      console.warn('eventStart not defined in either plan or course, defaulting to zero.')
      start = new Date(0)
    }

    let timezone = this.eventTimezone || this.course.eventTimezone
    if (!timezone) {
      console.warn('eventTimezone not defined in either plan or course, defaulting to UTC.')
      timezone = 'UTC'
    }

    this._cache.event = new Event({ ...this.course.track.start, start, timezone })

    return this._cache.event
  }

  get adjustForCutoffs() {
    return this._data.adjustForCutoffs
  }
  set adjustForCutoffs(v) {
    d('set:adjustForCutoffs')
    this._data.adjustForCutoffs = v
    delete this._cache.cutoffs
  }
  get cutoffs() {
    if (this._cache.cutoffs) return this._cache.cutoffs

    this._cache.cutoffs = this.adjustForCutoffs
      ? this.course.cutoffs.map((c) => new PlanCutoff({ courseCutoff: c, plan: this }))
      : []

    return this._cache.cutoffs
  }

  get strategy() {
    if (this._cache.strategy) return this._cache.strategy
    this._cache.strategy = new Strategy({ values: this._data.strategy, length: this.course.dist })
    return this._cache.strategy
  }

  set strategy(v) {
    /*
     strategy must be either
        null / undefined
      OR
        [{
          onset: Number,
          value: Number,
          type: String
        }]
    */

    delete this._cache.strategy

    // validate input:
    if (_.isNil(v)) {
      this._data.strategy = undefined
    } else if (
      Array.isArray(v) &&
      v.length &&
      v.length ===
        v.filter(
          (value) => _.isNumber(value.onset) && _.isNumber(value.value) && _.isString(value.type)
        ).length
    ) {
      this._data.strategy = v
    } else {
      this._data.strategy = undefined
      d('Plan "strategy" invalid.')
    }
  }

  get heatModel() {
    if (this._cache.heatModel !== undefined) return this._cache.heatModel

    if (this._data.heatModel) {
      this._cache.heatModel = Object.assign(
        {
          start: this.event.sun.sunrise + 1800,
          stop: this.event.sun.sunset + 7200
        },
        _.pick(this._data.heatModel, ['baseline', 'max'])
      )
    } else {
      this._cache.heatModel = null
    }

    return this._cache.heatModel
  }

  set heatModel(v) {
    this._data.heatModel = v
  }

  get totalDelay() {
    return this.delays.reduce((v, d) => {
      return v + d.delay
    }, 0)
  }

  get delays() {
    if (this._cache.delays) return this._cache.delays

    const delays = this.course.waypoints
      .map((waypoint) => {
        const wpd = this._data.delays?.find((d) => areSameWaypoint(d.waypoint, waypoint))
        const delay = wpd ? wpd.delay : waypoint.hasTypicalDelay ? this.waypointDelay : 0
        return new PlanDelay({ waypoint, delay })
      })
      .filter((d) => d.delay > 0)
      .sort((a, b) => a.loc - b.loc)

    // if any delays are in duplicate locations, combine them
    let i = 0
    while (delays.length - 1 >= i) {
      if (i > 0 && delays[i].loc === delays[i - 1].loc) {
        d(`get delays: merging delay at ${delays[i].loc} km`)
        delays[i - 1].delay += delays[i].delay
        delays.splice(i, 1)
      } else i++
    }

    this._cache.delays = delays

    return this._cache.delays
  }

  set delays(v) {
    this._data.delays = v
    delete this._cache.delays
  }

  get delay() {
    return this.totalDelay
  }

  get notes() {
    if (this._cache.notes) return this._cache.notes
    this._cache.notes =
      this._data.notes?.map((wpn) => ({
        waypoint: this.course.waypoints.find((waypoint) => areSameWaypoint(wpn.waypoint, waypoint)),
        text: wpn.text
      })) || []

    return this._cache.notes
  }

  set notes(v) {
    this._data.notes = v
    delete this._cache.notes
  }

  get splits() {
    if (!this._cache.splits) {
      this._cache.splits = new PlanSplits({ plan: this })
    }

    return this._cache.splits
  }

  getDelayAtWaypoint(waypoint) {
    return this.delays.find((d) => areSameWaypoint(d.waypoint, waypoint))?.delay || 0
  }

  getTypicalDelayAtWaypoint(waypoint) {
    if (waypoint.hasTypicalDelay) return this.waypointDelay
    return 0
  }

  getNoteAtWaypoint(waypoint) {
    return this.notes.find((d) => areSameWaypoint(d.waypoint, waypoint))?.text || ''
  }

  get pacing() {
    if (!this._cache.pacing) {
      delete this._cache.splits
      this._cache.pacing = new Pacing({ plan: this })
    }
    return this._cache.pacing
  }

  set pacing(v) {
    if (!v.__class === 'Pacing') throw new Error('Plan.pacing must be Pacing object')
    this._cache.pacing = v
  }

  calcPacing() {
    if (this.pacing?.status?.success === false) {
      d('Pacing calculation already failed; returning')
      return
    }

    d('calculating pacing')

    calcPacing({
      plan: this,
      options: {
        testLocations: this.course.waypoints.map((wp) => wp.loc)
      }
    })

    if (this.pacing.status.success)
      d(`pacing complete after ${this.pacing.status.iterations} iterations.`)
    else d(`pacing failed after ${this.pacing.status.iterations} iterations.`)
  }

  /**
   * Finds and optionally inserts a point at an input location.
   *
   * @param {Number} args.loc - The location (in km) to determine value.
   * @param {Boolean} args.insert - Whether to also insert a created point into the points array. Defaults to false.
   * @return {PlanPoint} The PlanPoint at input location.
   */
  getPoint({ loc, insert = false }) {
    // get and return it if already exists
    const i2 = this.points.findIndex((p) => rgte(p.loc, loc, 4))
    const p2 = this.points[i2]

    // if point exists, return it
    if (req(p2.loc, loc, 4)) return p2

    d(`getPoint: ${insert ? 'inserting' : 'creating'} new PlanPoint at ${loc}`)

    // define first point for interpolation
    const i1 = i2 - 1
    const p1 = this.points[i1]

    // create a new point
    const point = new PlanPoint(this, this.course.getPoint({ loc, insert }))

    // add in interpolated time values if they exist
    if (!isNaN(p1.time) && !isNaN(p2.time)) {
      const delay = p2.elapsed - p2.time - (p1.elapsed - p1.time)
      point.time = interp(p1.loc, p2.loc, p1.time + delay, p2.time, p2.loc)
      point.elapsed = p2.elapsed - (p2.time - point.time)
      if (this.event.start) point.tod = this.event.elapsedToTimeOfDay(point.elapsed)
    }

    if (insert) this.points.splice(i2, 0, point)

    return point
  }

  get points() {
    if (!this._cache.points) {
      d('creating points array')

      if (!this.course?.points?.length) {
        d('cannot create points array; course points are not defined.')
        throw new MissingDataError('Course points are not defined.', 'points')
      }

      this._cache.points = this.course.points.map((point) => new PlanPoint(this, point))

      this.applyPacing()
    }
    return this._cache.points
  }

  applyPacing(options = {}) {
    /*
     applyPacing adds time data
     mutates this.course.points

     returns result object: {
       factors: Object w/ overall factor values
       factor: overall pacing factor
     }
    */
    if (!this.course?.points?.length) return

    d('applyPacing')

    _.defaults(options, {
      addBreaks: true
    })

    if (options.addBreaks) {
      this.course.terrainFactors?.forEach((tf) => this.getPoint({ loc: tf.start, insert: true }))
    }

    // assign delays to points
    this.points
      .filter((p) => p.delay)
      .forEach((p) => {
        delete p.delay
      })
    this.delays?.forEach((d) => {
      const p = this.getPoint({ loc: d.loc, insert: true })
      p.delay = d.delay
    })

    // calculate course normalizing factor:
    const p = this.points
    let elapsed = 0
    p[0].elapsed = 0
    p[0].time = 0
    if (this.event.start) p[0].tod = this.event.elapsedToTimeOfDay(0)

    // variables & function for adding in delays:
    let delay = 0

    let dloc = 0
    let dtime = 0
    let factorSum = 0

    // initially we dont have a factor so use pace instead of np
    const np = this.pacing.factor ? this.pacing.np : this.pacing.pace

    const factorsSum = Object.fromEntries(fKeys.map((k) => [k, 0]))

    for (let j = 1, jl = p.length; j < jl; j++) {
      dloc = p[j].loc - p[j - 1].loc
      // determine pacing factor for point
      generateFactors(p[j - 1], { plan: this })

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
      if (this.event.start) p[j].tod = this.event.elapsedToTimeOfDay(elapsed)
    }
    // add factors to that last point
    generateFactors(_.last(p), { plan: this })

    // normalize factors total:
    const factors = new Factors(
      Object.fromEntries(fKeys.map((k) => [k, factorsSum[k] / this.course.dist]))
    )
    const factor = factorSum / this.course.dist

    return { factor, factors }
  }

  get events() {
    if (this._cache.events) return this._cache.events

    // create array of sun events during the course:
    d('calculating events.sun')
    const sun = []
    const eventTypes = ['dawn', 'sunrise', 'sunset', 'dusk']
    const startTimeOfDay = this.event.elapsedToTimeOfDay(0)
    const days = Math.ceil((startTimeOfDay + _.last(this.points).elapsed) / 86400)
    for (let d = 0; d < days; d++) {
      eventTypes.forEach((event) => {
        // get elapsed time of the event:
        const elapsed = this.event.sun[event] - startTimeOfDay + 86400 * d

        // if it happens in the data, add it to the array
        if (elapsed >= 0 && elapsed <= _.last(this.points).elapsed) {
          sun.push({ event, elapsed })
        }
      })
    }
    // sort by elapsed time:
    sun.sort((a, b) => a.elapsed - b.elapsed)
    // interpolate distances from elapsed times:
    if (sun.length) {
      const locs = interpArray(
        this.points.map((x) => {
          return x.elapsed
        }),
        this.points.map((x) => {
          return x.loc
        }),
        sun.map((x) => {
          return x.elapsed
        })
      )
      locs.forEach((l, i) => {
        sun[i].loc = l
      })
    }

    this._cache.events = { sun }

    return this._cache.events
  }

  get stats() {
    if (this._cache.stats) return this._cache.stats

    // add in statistics
    // these are max and min values for each factor
    d('calculating stats.factors')
    const factors = Object.fromEntries(
      fKeys.map((k) => {
        const values = this.points.map((p) => p.factors[k])
        return [
          k,
          {
            min: _.min(values),
            max: _.max(values)
          }
        ]
      })
    )

    // time in sun zones:
    d('calculating stats.sun')
    const sun = {
      day: { time: 0, dist: 0 },
      twilight: { time: 0, dist: 0 },
      dark: { time: 0, dist: 0 }
    }
    let dloc = 0
    let dtime = 0
    this.points.forEach((x, i) => {
      dloc = x.loc - (this.points[i - 1]?.loc || 0)
      dtime = x.elapsed - (this.points[i - 1]?.elapsed || 0)
      if (
        !isNaN(this.event.sun.dawn) &&
        !isNaN(this.event.sun.dusk) &&
        (x.tod <= this.event.sun.dawn || x.tod >= this.event.sun.dusk)
      ) {
        sun.dark.time += dtime
        sun.dark.dist += dloc
      } else if (x.tod < this.event.sun.sunrise || x.tod > this.event.sun.sunset) {
        sun.twilight.time += dtime
        sun.twilight.dist += dloc
      } else {
        sun.day.time += dtime
        sun.day.dist += dloc
      }
    })

    this._cache.stats = { factors, sun }

    return this._cache.stats
  }

  update(field, val) {
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
        waypoint = this.course.waypoints.find((wp) => areSameWaypoint(wp, waypoint))
        if (!waypoint) throw new Error('unknown waypoint')

        // find existing index
        const i = this._data.delays.findIndex((d) => areSameWaypoint(d.waypoint, waypoint))

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
        waypoint = this.course.waypoints.find((wp) => areSameWaypoint(wp, waypoint))
        if (!waypoint) throw new Error('unknown waypoint')

        // find existing index
        const i = this._data.notes.findIndex((d) => areSameWaypoint(d.waypoint, waypoint))

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

  invalidatePacing() {
    d('invalidatePacing')
    if (this.pacing?.status && !_.isUndefined(this.pacing.status.success))
      delete this.pacing.status.success
    delete this._cache.splits
  }

  checkPacing() {
    if (!this.pacing.status.success) {
      d('checkPacing -- calcPacing')
      this.calcPacing()
    }
    if (!this.points?.length) {
      d('checkPacing -- applyPacing')
      this.applyPacing()
    }
    return true
  }
}

class PlanDelay {
  constructor(data) {
    Object.assign(this, data)
  }

  get loc() {
    return this.waypoint.loc
  }
}

class PlanCutoff {
  constructor(data) {
    Object.assign(this, data)
  }

  get waypoint() {
    return this.courseCutoff.waypoint
  }
  get loc() {
    return this.courseCutoff.loc
  }
  get time() {
    return (
      this.courseCutoff.time -
      Math.max(this.plan.cutoffMargin || 0, this.plan.getDelayAtWaypoint(this.waypoint))
    )
  }
}
