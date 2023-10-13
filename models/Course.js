import _ from 'lodash'
import { interp, req, rgte } from '../util/math.js'
import { interpolatePoint } from './Points/interpolate.js'
import { Event } from './Event.js'
import { createSegments, createSplits } from '../geo.js'
import { CoursePoint } from './CoursePoint.js'
import { Site } from './Site.js'
import { Track } from './Track.js'
import { createDebug, MissingDataError } from '../util/index.js'

const d = createDebug('models:Course')

class CourseSplits {
  constructor(data) {
    Object.defineProperty(this, '_cache', { value: {} })
    Object.assign(this, data)
  }

  get __class() {
    return 'CourseSplits'
  }

  get segments() {
    if (!this._cache.segments?.length) {
      this._cache.segments = createSegments({ course: this.course })
    }
    return this._cache.segments
  }

  set segments(v) {
    this._cache.segments = v
  }

  get miles() {
    if (!this._cache.miles?.length) {
      this._cache.miles = createSplits({ unit: 'miles', course: this.course })
    }
    return this._cache.miles
  }

  set miles(v) {
    this._cache.miles = v
  }

  get kilometers() {
    if (!this._cache.kilometers?.length) {
      this._cache.kilometers = createSplits({ unit: 'kilometers', course: this.course })
    }
    return this._cache.kilometers
  }

  set kilometers(v) {
    this._cache.kilometers = v
  }
}

// course constructor will pass through all fields; use
// this array to omit certain keys from passing through
const disallowed = ['cache', 'distance']

export class Course {
  constructor(data) {
    Object.defineProperty(this, '_data', {
      value: data._data || {
        sites: [
          new Site({
            course: this,
            _id: _.random(10000, 20000),
            name: 'Start',
            type: 'start',
            percent: 0
          }),
          new Site({
            course: this,
            _id: _.random(30000, 40000),
            name: 'Finish',
            type: 'finish',
            percent: 1
          })
        ]
      },
      enumerable: true
    })

    // used to store results of processed information in _data to speed up calcs
    Object.defineProperty(this, '_cache', { value: {} })

    // other fields just pass along:
    const keys = Object.keys(data).filter((k) => !disallowed.includes(k))
    Object.assign(this, _.pick(data, keys))
  }

  get __class() {
    return 'Course'
  }

  get loops() {
    return this._data.loops || 1
  }
  set loops(v) {
    if (v !== this._data.loops) {
      this._data.loops = v
      this.clearCache(2)
    }
  }

  get dist() {
    return (
      this._cache.dist ||
      (this._cache.dist =
        this._data.dist || (this.track?.dist ? this.track.dist * this.loops : undefined))
    )
  }
  get gain() {
    return (
      this._cache.gain ||
      (this._cache.gain =
        this._data.gain || (this.track?.gain ? this.track.gain * this.loops : undefined))
    )
  }
  get loss() {
    return (
      this._cache.loss ||
      (this._cache.loss =
        this._data.loss || (this.track?.loss ? this.track.loss * this.loops : undefined))
    )
  }

  set dist(v) {
    if (!req(v, this._data.dist, 6)) {
      d(`overriding dist to ${v}`)
      this._data.dist = v
      this.clearCache(2)
    }
  }
  set gain(v) {
    if (!req(v, this._data.gain, 6)) {
      d(`overriding gain to ${v}`)
      this._data.gain = v
      this.clearCache(2)
    }
  }
  set loss(v) {
    if (!req(v, this._data.loss, 6)) {
      d(`overriding loss to ${v}`)
      this._data.loss = v
      this.clearCache(2)
    }
  }

  get distScale() {
    return this._data.dist ? this._data.dist / (this.track.dist * this.loops) : 1
  }
  get gainScale() {
    return this._data.gain ? this._data.gain / (this.track.gain * this.loops) : 1
  }
  get lossScale() {
    return this._data.loss ? this._data.loss / (this.track.loss * this.loops) : 1
  }

  get loopDist() {
    return this.dist / this.loops
  }
  get loopGain() {
    return this.gain / this.loops
  }
  get loopLoss() {
    return this.loss / this.loops
  }

  // create waypoints from sites:
  get sites() {
    return this._data.sites
  }

  set sites(data) {
    this._data.sites = data.map((site) =>
      site.__class === 'Site' ? site : new Site(_.assign(site, { course: this }))
    )
    this.clearCache(1)
  }

  clearCache(level = 1) {
    // level 1 means route itself does not change (eg, changes to waypoints and trivial changes to course)
    // level 2 means route itself changes (eg, track, loops, dist, gain, loss)
    d(`clearCache-${level}`)

    const keys =
      level === 1
        ? ['waypoints', 'terrainFactors', 'cutoffs', 'stats', 'splits']
        : Object.keys(this._cache)

    keys.forEach((key) => {
      delete this._cache[key]
    })

    if (level === 2)
      this.sites.forEach((site) => {
        site.clearCache()
      })
  }

  get waypoints() {
    if (this._cache.waypoints) return this._cache.waypoints

    if (!this.track?.dist) return []

    let waypoints = []
    this.sites.forEach((site) => {
      waypoints.push(...site.waypoints)
    })
    waypoints = waypoints.sort((a, b) => a.loc - b.loc)

    this._cache.waypoints = waypoints
    return this._cache.waypoints
  }

  get track() {
    return this._data.track
  }

  set track(v) {
    d('set-track')
    if (v.__class === 'Track') this._data.track = v
    else this._data.track = new Track(v)
    this.clearCache(2)
  }

  get points() {
    if (this._cache.points) return this._cache.points

    d('generating points array')

    if (!this.track?.points?.length)
      throw new MissingDataError('Track points are not defined.', 'points')

    this._cache.points = new Array(this.track.points.length * this.loops)
    for (let l = 0; l < this.loops; l++) {
      for (let i = 0; i < this.track.points.length; i++) {
        this.points[i + l * this.track.points.length] = new CoursePoint(
          this,
          this.track.points[i],
          l
        )
      }
    }

    return this._cache.points
  }

  set points(v) {
    throw new Error('cannot set points directly')
  }

  /**
   * Finds and optionally inserts a point at an input location.
   *
   * @param {Number} args.loc - The location (in km) to determine value.
   * @param {Boolean} args.insert - Whether to also insert a created point into the points array. Defaults to false.
   * @return {CoursePoint} The CoursePoint at input location.
   */
  getPoint({ loc, insert = false }) {
    const i2 = this.points.findIndex((p) => rgte(p.loc, loc, 4))
    const p2 = this.points[i2]

    // if point exists, return it
    if (req(p2.loc, loc, 4)) return p2

    d(`getPoint: ${insert ? 'inserting' : 'creating'} new CoursePoint at ${loc}`)

    // define first point for interpolation
    const i1 = i2 - 1
    const p1 = this.points[i1]

    // create a new point
    const trackPoint = interpolatePoint(p1.point, p2.point, (loc % this.loopDist) / this.distScale)
    const point = new CoursePoint(this, trackPoint, Math.floor(loc / this.loopDist))

    // if points have actuals tied to them, also interpolate the actuals:
    if (p1.actual && p2.actual) {
      point.actual = interpolatePoint(p1.actual, p2.actual, loc)
      point.actual.elapsed = interp(p1.loc, p2.loc, p1.actual.elapsed, p2.actual.elapsed, point.loc)
    }

    if (insert) this.points.splice(i2, 0, point)

    return point
  }

  refreshWaypointLLAs() {
    this.waypoints
      .filter((wp) => wp.loop === 1 || wp.type === 'finish')
      .forEach((wp) => {
        wp.refreshLLA()
      })
  }

  // terrainFactors: array of TerrainFactor objects only where actual terrain factor values exist
  get terrainFactors() {
    if (this._cache.terrainFactors) return this._cache.terrainFactors
    d('regenerating terrainFactors')
    const arr = this.waypoints.filter(
      (x, i) =>
        i === 0 ||
        (!_.isNil(x.terrainFactor) && x.terrainFactor !== this.waypoints[i - 1]?.terrainFactor)
    )
    this._cache.terrainFactors = arr.map((x, i) => {
      return new TerrainFactor({
        startWaypoint: x,
        endWaypoint: arr[i + 1] || _.last(this.waypoints),
        value: x.terrainFactor
      })
    })

    return this._cache.terrainFactors
  }

  // terrainTypes: array of TerrainType objects only where actual terrain type changes exist
  get terrainTypes() {
    if (this._cache.terrainTypes) return this._cache.terrainTypes
    d('regenerating terrainTypes')
    const arr = this.waypoints.filter(
      (x, i) => !_.isNil(x.terrainType) && x.terrainType !== this.waypoints[i - 1]?.terrainType
    )
    this._cache.terrainTypes = arr.map((x, i) => {
      return new TerrainType({
        startWaypoint: x,
        endWaypoint: arr[i + 1] || _.last(this.waypoints),
        value: x.terrainType
      })
    })

    return this._cache.terrainTypes
  }

  get cutoffs() {
    if (this._cache.cutoffs) return this._cache.cutoffs

    this._cache.cutoffs = this.waypoints
      .filter((wp) => wp.cutoff)
      .map((wp) => new CourseCutoff({ waypoint: wp }))

    return this._cache.cutoffs
  }

  get splits() {
    if (!this._cache.splits) {
      this._cache.splits = new CourseSplits({ course: this })
    }

    return this._cache.splits
  }

  // calculate max and min values along course
  get stats() {
    if (this._cache.stats) return this._cache.stats

    d('stats:calculate')

    const alts = this.track.points.map((p) => p.alt)
    const grades = this.track.points.map((p) => p.grade)
    const terrains = this.terrainFactors.map((tf) => tf.value / 100 + 1)

    const stats = {
      altitude: {
        avg:
          _.sum(
            this.track.points.map((p, i) => p.alt * (p.loc - (this.track.points[i - 1]?.loc || 0)))
          ) / this.track.dist,
        max: _.max(alts),
        min: _.min(alts)
      },
      grade: {
        avg: (_.last(this.track.points).alt - this.track.points[0].alt) / this.track.dist / 10,
        max: _.max(grades),
        min: _.min(grades)
      },
      terrain: {
        avg:
          (_.sumBy(this.terrainFactors, (tF) => (tF.end - tF.start) * tF.value) / this.dist + 100) /
          100,
        max: _.max(terrains),
        min: _.min(terrains)
      }
    }

    // get distances for max/min terrain
    const terrainFactorDist = (val) =>
      this.terrainFactors.reduce((a, b) => (b.value / 100 + 1 === val ? a + b.end - b.start : a), 0)
    Object.assign(stats.terrain, {
      maxDist: terrainFactorDist(stats.terrain.max),
      minDist: terrainFactorDist(stats.terrain.min)
    })

    this._cache.stats = stats
    return stats
  }

  set stats(v) {
    this._cache.stats = v
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

    const start = this.eventStart || undefined
    const timezone = this.eventTimezone || undefined
    this._cache.event =
      start && timezone && this.track?.start
        ? new Event({
            ...this.track.start,
            start,
            timezone
          })
        : undefined

    return this._cache.event
  }
}

class CourseCutoff {
  constructor(data) {
    Object.assign(this, data)
  }

  get loc() {
    return this.waypoint.loc
  }
  get time() {
    return this.waypoint.cutoff
  }
}

class TerrainFactor {
  constructor(data) {
    data = _.defaults(data, { value: 0 })
    Object.assign(this, data)
  }

  get start() {
    return this.startWaypoint.loc
  }
  get end() {
    return this.endWaypoint.loc
  }
}

class TerrainType {
  constructor(data) {
    Object.assign(this, data)
  }

  get start() {
    return this.startWaypoint.loc
  }
  get end() {
    return this.endWaypoint.loc
  }
}
