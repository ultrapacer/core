import _ from 'lodash'
import { req, round } from '../util/math.js'
import { latlon as LatLon } from 'sgeo'
import { interpolatePoint } from './Points/interpolate.js'
import { Point } from './Point.js'
import { addLocations } from './Points/addLocations.js'
import { addGrades } from './Points/addGrades.js'
import { getSmoothedProfile } from './Points/getSmoothedProfile.js'
import { createDebug, MissingDataError } from '../util/index.js'

const d = createDebug('models:Track')

export class Track {
  constructor(arg) {
    d('Creating new Track object')
    Object.defineProperty(this, '_data', { value: { stats: {} } })
    Object.defineProperty(this, '_cache', { value: {} })
    Object.defineProperty(this, 'type', { value: 'course', enumerable: true, writable: true })

    // assign type first (other setters use it)
    if (arg.type) this.type = arg.type

    d(`Initializing fields: ${Object.keys(arg).join(', ')}`)
    Object.assign(this, arg)
  }

  get __class() {
    return 'Track'
  }

  clearCache() {
    Object.keys(this._cache).forEach((key) => {
      delete this._cache[key]
    })
  }

  set points(v) {
    d('set-points')
    this.clearCache()

    // v can be either array of [{lat, lon, alt}] or object {lat:[], lon:[], alt:[]}
    if (!Array.isArray(v)) v = v.lat.map((x, i) => [v.lat[i], v.lon[i], v.alt[i]])

    if (v[0].__class !== 'Point')
      v = v.map((p) => {
        return new Point(p)
      })

    addLocations(v)
    addGrades(v)

    this._data.points = v
    d(`set-points - ${v.length} points`)
  }

  get points() {
    return this._data.points
  }

  set start(v) {
    this._data.start = v
  }
  get start() {
    const val = this.points?.[0] ? _.pick(this.points[0], ['lat', 'lon']) : this._data.start
    if (!val) throw new MissingDataError('Neither start not track points are defined.', 'points')
    return val
  }

  set finish(v) {
    this._data.finish = v
  }
  get finish() {
    const val = this.points?.length
      ? _.pick(_.last(this.points), ['lat', 'lon'])
      : this._data.finish
    if (!val) throw new MissingDataError('Neither finish nor points points are defined.', 'points')
    return val
  }

  set stats(v) {
    Object.assign(this._data, v)
  }

  get stats() {
    if (this._cache.stats) return this._cache.stats
    if (this.points) {
      d('Calculating')
      const dist = _.last(this.points).loc
      let gain = 0
      let loss = 0
      let delta = 0
      let last = this.points[0].alt
      this.points.forEach((p) => {
        delta = p.alt - last
        if (delta < 0) {
          loss += delta
        } else {
          gain += delta
        }
        last = p.alt
      })

      this._cache.stats = { gain, loss, dist }

      return this._cache.stats
    }
    return this._data.stats
  }

  get dist() {
    return this.stats.dist
  }
  set dist(v) {
    this._data.stats.dist = v
  }

  get gain() {
    return this.stats.gain
  }
  set gain(v) {
    this._data.stats.gain = v
  }

  get loss() {
    return this.stats.loss
  }
  set loss(v) {
    this._data.stats.loss = v
  }

  // get lat, lon, alt, index for distance location(s) along track
  getLLA(location, opts = {}) {
    // location : distance or array of distances in km
    // opts :
    //   start : optional start index to speed up search; only for single location

    // if location is already array, copy, otherwise make it one:
    const isArray = Array.isArray(location)
    const locs = isArray ? [...location] : [location]

    // if track has loops, just look at location within first loop (eg track)
    locs.forEach((l, i) => {
      if (l > this.dist) locs[i] = l % this.dist
    })

    // initialize variables:
    // start at 0 or at input start point (for single location)
    let i = locs.length === 1 && opts.start && opts.start < this.points.length - 1 ? opts.start : 0

    // determine which way to look
    const back = Boolean(i && this.points[i].loc > locs[0])

    const llas = []
    const il = this.points.length - 1
    location = locs.shift()
    function prev(i) {
      return back ? i + 1 : i - 1
    }

    while (i <= il && i >= 0) {
      let p, ind

      // if its the start:
      if (location === 0) {
        p = this.points[0]
        ind = 0

        // or the finish:
      } else if (req(location, this.dist, 4)) {
        p = _.last(this.points)
        ind = this.points.length - 1
      } else if (
        (!back && (i === il || this.points[i].loc >= location)) ||
        (back && (i === 0 || this.points[i].loc <= location))
      ) {
        // if there is an exact point:
        if (this.points[i].loc === location || (!back && i === il) || (back && i === 0)) {
          p = this.points[i]
          ind = i

          // otherwise interpolate:
        } else {
          p = interpolatePoint(this.points[prev(i)], this.points[i], location)
          ind = i
        }
      } else {
        back ? i-- : i++
      }
      if (p) {
        const { lat, lon, alt, grade } = p
        llas.push({ lat, lon, alt, grade, ind })
        location = locs.shift()
        if (location == null) break
      }
    }
    return isArray ? llas : llas[0]
  }

  getNearestPoint(latlon, start, limit) {
    // iterate to new location based on waypoint lat/lon
    // latlon: sgeo LatLon object
    // start: starting point in current track
    // limit: max distance it can move
    const steps = 5
    let jj = this.points.findIndex((p) => p === start)
    let p = this.points[jj]
    let min = 0

    while (limit > 0.025) {
      const size = limit / steps
      const ps = [p]

      // loop thru incremental steps:
      for (let i = 1; i <= steps; i++) {
        const l = p.loc + size * i
        if (l <= this.dist) {
          while (this.points[jj + 1].loc < l && jj < this.points.length - 1) {
            jj++
          }
          ps.push(this.points[jj])
        }
      }

      // get an array of distances from reference latlon:
      const dists = ps.map((x) => {
        return Number(latlon.distanceTo(x.latlon))
      })

      // find the minimum distance:
      min = Math.min(...dists)
      const imin = dists.findIndex((d) => d === min)

      // set the new point to the one w/ min distance:
      p = ps[imin]

      // downsize iteration
      limit = limit / steps
    }
    return {
      point: p,
      delta: min
    }
  }

  /**
   * Returns nearest location to input lat/lon pair.
   *
   * @param {Number[]}  ll        [lat, lon] array.
   * @param {Number}    [start]   starting location in meters.
   * @param {Number}    [limit]   max distance it can move.
   * @return {Number}             The nearest location to input lat/lon pair.
   */
  getNearestLoc(ll, start = null, limit) {
    const steps = 5
    const LLA1 = new LatLon(ll[0], ll[1])

    let min, loc
    const iterateLoc = (start, limit) => {
      loc = start
      while (limit > 0.025) {
        const size = limit / steps
        let locs = []

        for (let i = -steps; i <= steps; i++) {
          const l = loc + size * i
          if (l > 0 && l <= this.dist) {
            locs.push(Math.max(0, Math.min(l, this.dist)))
          }
        }
        locs = locs.filter((v, i, s) => s.indexOf(v) === i)

        const llas = this.getLLA(locs)
        llas.forEach((lla) => {
          const LLA2 = new LatLon(lla.lat, lla.lon)
          lla.dist = Number(LLA1.distanceTo(LLA2))
        })
        min = llas.reduce((min, b) => Math.min(min, b.dist), llas[0].dist)
        const j = llas.findIndex((x) => x.dist === min)
        loc = locs[j]
        limit = limit / steps // downsize iteration
      }
    }

    // try first getting something close
    if (start !== null) {
      start = Math.min(start, this.dist)
      const limit = Math.max(0.5, 0.05 * this.dist)
      iterateLoc(start, limit)
      if (min < 0.1) return loc
    }

    // now try getting anything
    start = this.dist / 2
    limit = Math.max(this.dist - start, start)
    iterateLoc(start, limit)
    return loc
  }

  // if criteria is met, returns new Track object w/ reduced points
  // otherwise, returns this
  reduceDensity({ spacing, length } = {}) {
    const d2 = d.extend('reduceDensity')
    // reduce density of points for processing
    if (!spacing) spacing = 0.025 // meters between points
    if (!length) length = this.points.length / 2
    if (this.dist / spacing > length / 2) {
      d2('Does not meet criteria')
      return this
    }

    // only reformat if it cuts the size down in half
    const len = this.dist
    const numpoints = Math.floor(len / spacing) + 1
    const xs = Array(numpoints)
      .fill(0)
      .map((e, i) => round(i++ * spacing, 3))
    if (xs[xs.length - 1] < len) {
      xs.push(len)
    }
    const adj = getSmoothedProfile({ points: this.points, locs: xs, gt: 2 * spacing })
    const points = this.getLLA(xs, 0).map((lla, i) => [
      round(lla.lat, 6),
      round(lla.lon, 6),
      round(adj[i].alt, 2)
    ])
    const source = this.source
    const track = new Track({ source, points })

    d2(`Reduced from ${this.points.length} to ${track.points.length} points.`)
    return track
  }
}
