/* eslint-disable no-unreachable */
import _ from 'lodash'

import { list as fKeys } from '../factors/index.js'
import { Strategy } from '../factors/strategy/index.js'
import { createSegments, createSplits } from '../geo.js'
import { Callbacks } from '../util/Callbacks.js'
import { areSame, createDebug, MissingDataError } from '../util/index.js'
import { interp, interpArray, req, rgte } from '../util/math.js'
import { Event } from './Event.js'
import { Pacing } from './Pacing.js'
import { PlanPoint } from './PlanPoint.js'

const d = createDebug('models:Plan')

const areSameWaypoint = (a, b) => areSame(a.site, b.site) && a.loop === b.loop

class PlanSplits {
  constructor(data) {
    Object.defineProperty(this, '_cache', { value: {} })
    Object.defineProperty(this, '_data', { value: {} })
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
  constructor(data) {
    Object.defineProperty(this, 'pacing', { writable: false, value: new Pacing({ plan: this }) })

    Object.defineProperty(this, '_data', {
      value: {
        adjustForCutoffs: true,
        delays: [],
        notes: []
      },
      enumerable: false
    })

    // used to store results of processed information in _data to speed up calcs
    Object.defineProperty(this, '_cache', { value: {}, writable: true })

    if (data.course) Object.defineProperty(this, 'course', { writable: false, value: data.course })
    else throw new Error('Course required')

    // other fields just pass along:
    // plan constructor will pass through all fields; use
    // this array to omit certain keys from passing through
    const disallowed = ['course', '_data', 'cache']
    Object.keys(data).forEach((k) => {
      if (!disallowed.includes(k)) this[k] = data[k]
    })

    Object.defineProperty(this, 'callbacks', {
      writable: false,
      value: new Callbacks(this, ['onUpdated'])
    })
  }

  get __class() {
    return 'Plan'
  }

  clearCache() {
    d('clearCache')
    this._cache = {}
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
      ? this.course.cutoffs.map(
          (c) =>
            new PlanCutoff({
              courseCutoff: c,
              plan: this,
              point: this.getPoint({ loc: c.loc, insert: true })
            })
        )
      : []

    // if any cutoffs are extraneous, delete them
    let i = 0
    while (this._cache.cutoffs.length - 1 >= i) {
      const cutoff = this._cache.cutoffs[i]
      if (this._cache.cutoffs.find((c, j) => j > i && c.time <= cutoff.time)) {
        d(`get cutoffs: deleting extraneous cutoff at ${cutoff.loc} km`)
        this._cache.cutoffs.splice(i, 1)
      } else i++
    }

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
    if (_.isUndefined(v)) v = []
    else if (!_.isArray(v)) throw new Error('"delays" must be an array')
    this._data.delays = v
    delete this._cache.delays
  }

  get delay() {
    return this.totalDelay
  }

  get notes() {
    if (this._cache.notes) return this._cache.notes
    this._cache.notes = this._data.notes.map((wpn) => ({
      waypoint: this.course.waypoints.find((waypoint) => areSameWaypoint(wpn.waypoint, waypoint)),
      text: wpn.text
    }))

    return this._cache.notes
  }

  set notes(v) {
    if (_.isUndefined(v)) v = []
    else if (!_.isArray(v)) throw new Error('"notes" must be an array')
    this._data.notes = v
    delete this._cache.notes
  }

  get splits() {
    if (!this._cache.splits) {
      d('creating splits')
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

      // TEMP TODO FIX - use cached pacing data to speed up if we have it?
      //d('points:get calculating')
      //this.pacing.calculate()
    }
    return this._cache.points
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

  /**
   * update Plan with key/value pairs
   * @param {*} params
   */
  update(params) {
    const d2 = d.extend('update')
    d2(`fields: ${Object.keys(params).join(', ')}`)

    _.forOwn(params, (val, field) => {
      switch (field) {
        case '_id':
        case 'name':
        case 'description':
          this[field] = val
          break
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
          delete this._cache.cutoffs
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
        default:
          this[field] = val
          d2('clearCache, invalidatePacing')
          this.clearCache()
          this.invalidatePacing()
      }
    })

    this.callbacks.execute('onUpdated')
  }

  invalidatePacing() {
    d('invalidatePacing')
    this.pacing.invalidate()
    delete this._cache.splits
  }

  checkPacing() {
    d('checkPacing')
    if (!this.pacing.status?.complete) {
      d('checkPacing: calculate')
      this.pacing.calculate()
    }

    // this is mostly just to trigger the points getter
    if (!this.points?.length) throw new Error('No plan points')
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
