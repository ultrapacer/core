const { round, interp, wlslr } = require('./math')
const gpxParse = require('gpx-parse')
const { logger } = require('./logger')
const { latlon: LatLon } = require('sgeo')
const { makeReactive } = require('./util')
const { Point, interpolatePoint } = require('./points')

class Track extends Array {
  constructor (arg) {
    super(arg)

    makeReactive(this)
  }

  // this makes built-in Array methods return Array object instead of Track object:
  static get [Symbol.species] () {
    return Array
  }

  get last () {
    return this[this.length - 1]
  }

  addLocations (distance = null) {
    logger('Track|addLocations')
    let d = 0
    let l = 0
    this[0].loc = 0
    this[0].dloc = 0
    for (let i = 1, il = this.length; i < il; i++) {
      d = gpxParse.utils.calculateDistance(
        this[i - 1].lat,
        this[i - 1].lon,
        this[i].lat,
        this[i].lon
      )
      l += d
      this[i].dloc = d
      this[i].loc = l
    }
    if (distance) {
      logger('Track|addLocations : scaling distances')
      if (round(this.last.loc, 4) !== round(distance, 4)) {
        this.scales.distance = distance / this.last.loc
        this.forEach((x, i) => {
          x.dloc = x.dloc * this.scales.distance
          x.loc = x.loc * this.scales.distance
        })
      }
    }
  }

  cleanUp () {
    logger('Track|cleanup')
    // function fixes issues with tracks

    // REMOVE ALITITUDE STEPS FROM THE GPX. HAPPENS SOMETIMES WITH STRAVA DEM
    const at = 20 // meters step size
    const gt = 200 // % grade
    let i = 0
    // create array of step indices
    const steps = []
    for (let i = 1, il = this.length; i < il; i++) {
      if (
        Math.abs((this[i].alt - this[i - 1].alt)) > at ||
        Math.abs((this[i].alt - this[i - 1].alt) / this[i].dloc / 10) > gt
      ) {
        steps.push(i)
      }
    }
    // for each step, find extents of adjacent flat sections and interp new alt
    steps.forEach(s => {
      let a = s - 1
      while (a >= 0 && this[s - 1].alt === this[a].alt) { a -= 1 }
      a += 1
      let z = s
      while (z <= this.length - 1 && this[s].alt === this[z].alt) { z += 1 }
      z -= 1
      if (z - a > 1) {
        logger(`Track|cleanUp: fixing altitude step at ${round(this[s].loc, 2)} km from ${round(this[a].alt, 2)} m to ${round(this[z].alt, 2)} m`)
        for (i = a + 1; i < z; i++) {
          this[i].alt = interp(
            this[a].loc,
            this[z].loc,
            this[a].alt,
            this[z].alt,
            this[i].loc
          )
        }
      }
    }
    )
  }

  addGrades () {
  // add grade field to points array
    logger('Track|addGrades')
    const locs = Array(...this).map(x => x.loc)
    const lsq = this.getSmoothedProfile(locs, 0.05)
    this.forEach((p, i) => {
      p.grade = round(lsq[i].grade, 4)
    })
  }

  calcStats (smooth = true) {
    // return course { gain, loss, dist }
    logger(`Track|calcStats smooth=${smooth}`)
    const d = this.last.loc
    let gain = 0
    let loss = 0
    let delta = 0
    let points
    if (smooth) {
      const locs = this.map(x => x.loc)
      points = this.getSmoothedProfile(locs, 0.05)
    } else {
      points = this
    }
    let last = points[0].alt
    points.forEach(p => {
      delta = p.alt - last
      if (delta < 0) {
        loss += delta
      } else {
        gain += delta
      }
      last = p.alt
    })
    const stats = {
      gain: gain,
      loss: loss,
      dist: d
    }
    if (!smooth) {
      this.stats = { ...stats }
    }
    return stats
  }

  // get lat, lon, alt, index for distance location(s) along track
  getLLA (location, opts = {}) {
    // location : distance or array of distances in km
    // opts :
    //   start : optional start index to speed up search; only for single location

    // if location is already array, copy, otherwise make it one:
    const locs = Array.isArray(location) ? [...location] : [location]

    logger(`Track|getLLA for ${locs.length} location(s).`)

    // initialize variables:
    // start at 0 or at input start point (for single location)
    let i = locs.length === 1 && opts.start && opts.start < this.length - 1 ? opts.start : 0

    // determine which way to look
    const back = Boolean(i && this[i].loc > locs[0])

    const llas = []
    const il = this.length - 1
    location = locs.shift()
    function prev (i) { return back ? i + 1 : i - 1 }

    while (i <= il && i >= 0) {
      if (
        (!back && (i === il || this[i].loc >= location)) ||
        (back && (i === 0 || this[i].loc <= location))
      ) {
        if (this[i].loc === location || (!back && i === il) || (back && i === 0)) {
          llas.push({
            lat: this[i].lat,
            lon: this[i].lon,
            alt: this[i].alt,
            grade: this[i].grade,
            ind: i
          })
        } else {
          const p3 = interpolatePoint(this[prev(i)], this[i], location)
          llas.push({
            lat: p3.lat,
            lon: p3.lon,
            alt: p3.alt,
            grade: p3.grade,
            ind: i
          })
        }
        location = locs.shift()
        if (location == null) {
          break
        }
      } else {
        back ? i-- : i++
      }
    }
    return (llas.length > 1) ? llas : llas[0]
  }

  getNearestLoc (ll, start, limit) {
    logger('Track|getNearestLoc')
    // iterate to new location based on waypoint lat/lon
    // ll: [lat, lon] array
    // start: starting location in meters
    // limit: max distance it can move
    const steps = 5
    let loc = Math.min(this.last.loc, start)
    const LLA1 = new LatLon(ll[0], ll[1])
    while (limit > 0.025) {
      const size = limit / steps
      const locs = []
      for (let i = -steps; i <= steps; i++) {
        const l = loc + (size * i)
        if (l > 0 && l <= this.last.loc) {
          locs.push(l)
        }
      }
      const llas = this.getLLA(locs)
      llas.forEach(lla => {
        const LLA2 = new LatLon(lla.lat, lla.lon)
        lla.dist = Number(LLA1.distanceTo(LLA2))
      })
      const min = llas.reduce((min, b) => Math.min(min, b.dist), llas[0].dist)
      const j = llas.findIndex(x => x.dist === min)
      loc = locs[j]
      limit = limit / steps // downsize iteration
    }
    return loc
  }

  getSmoothedProfile (locs, gt) {
    // locs: array of locations (km)
    // gt: grade smoothing threshold
    logger('Track|getSmoothedProfile')
    const mbs = wlslr(
      this.map(p => { return p.loc }),
      this.map(p => { return p.alt }),
      locs,
      gt
    )
    const ga = []
    locs.forEach((x, i) => {
      let grade = mbs[i][0] / 10
      if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
      const alt = (x * mbs[i][0]) + mbs[i][1]
      ga.push({
        grade: grade,
        alt: alt
      })
    })
    return ga
  }

  reduceDensity () {
  // reduce density of points for processing
  // correct distance
    logger('Track|reduceDensity')
    const spacing = 0.025 // meters between points

    // only reformat if it cuts the size down in half
    if (this.last.loc / spacing < this.length / 2) {
      const len = this.last.loc
      const numpoints = Math.floor(len / spacing) + 1
      const xs = Array(numpoints).fill(0).map((e, i) => round(i++ * spacing, 3))
      if (xs[xs.length - 1] < len) {
        xs.push(len)
      }
      const adj = this.getSmoothedProfile(xs, 2 * spacing)
      const llas = this.getLLA(xs, 0)

      // reformat
      const points = new Track(
        llas.map((lla, i) => {
          return [
            round(lla.lat, 6),
            round(lla.lon, 6),
            round(adj[i].alt, 2)
          ]
        })
      )
      // replace locs and grades
      points.forEach((p, i) => {
        p.loc = xs[i]
        p.dloc = (i > 0) ? xs[0] - xs[i - 1] : 0
        p.grade = round(adj[i].grade, 4)
      })

      logger(`Track|reduceDensity: Reduced from ${this.length} to ${points.length} points`)
      return points
    } else {
      return this
    }
  }

  // map array of actual times to this
  async addActuals (actual) {
    const t = logger(`Track|addActuals : mapping ${actual.length} points`)
    actual = actual.map(p => {
      const x = { ...p }
      x.ll = new LatLon(p.lat, p.lon)
      return x
    })
    let MatchFailure = {}
    try {
      for (let index = 0; index < this.length; index++) {
        const p = this[index]
        // this requires a lot of processing; prevent browser from hanging:
        if (index % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 5))
        }

        const ll = new LatLon(p.lat, p.lon)
        // pick all points within the next "th"
        let j = 0
        let darr = []
        while (darr.length === 0 || j > darr.length / 3) {
          if (j !== 0) { actual.shift() }
          const ths = [0.050, 0.075, 0.100, 0.15, 0.2]
          for (let ith = 0; ith < ths.length; ith++) {
            darr = actual.filter(
              (a, i) => a.loc - actual[0].loc <= ths[ith] || i < 3
            ).map(a => {
              return Number(ll.distanceTo(a.ll))
            })
            j = darr.findIndex(d => d === Math.min(...darr))
            if (darr[j] < ths[ith]) { break }
          }
        }
        if (darr[j] === 0) {
          p.actual = {
            loc: actual[0].loc,
            elapsed: actual[0].elapsed
          }
        } else {
          const a1 = actual[j]
          const a2 = darr[j + 1] >= darr[j - 1] ? actual[j + 1] : actual[j - 1]
          const d1 = darr[j]
          const d2 = darr[j + 1] >= darr[j - 1] ? darr[j + 1] : darr[j - 1]
          if (d1 > 0.25) {
            MatchFailure = {
              match: false,
              point: p
            }
            throw MatchFailure
          }
          if (a2) {
            p.actual = {
              loc: interp(0, 1, a1.loc, a2.loc, d1 / (d1 + d2)),
              elapsed: interp(0, 1, a1.elapsed, a2.elapsed, d1 / (d1 + d2))
            }
          } else {
            p.actual = {
              loc: a1.loc,
              elapsed: a1.elapsed
            }
          }
        }
      }
      logger('Track|addActuals MATCH', t)
      return {
        match: true
      }
    } catch (e) {
      logger('Track|addActuals FAIL', t)
      return MatchFailure
    }
  }
}

async function create (arr, opts = {}) {
  const clean = opts.clean !== false // default to true
  const loops = opts.loops || 1
  logger(`track|create for ${arr.length} points and ${loops} loop(s). clean=${clean}.`)
  let points = arr.map(p => { return new Point(p) })

  if (clean) {
    const prev = points.length
    points = points.filter((p, i) =>
      i === 0 ||
      round(p.lat - points[i - 1].lat, 8) !== 0 ||
      round(p.lon - points[i - 1].lon, 8) !== 0
    )
    if (prev > points.length) {
      logger(`tracks|create: removed ${prev - points.length} zero-distance points`)
    }
  }

  // add all points to this
  const track = new Track(points.length * loops)

  // populate track points
  for (let i = 0; i < points.length * loops; i++) {
    track[i] = new Point(points[i % points.length])
  }

  track.scales = { distance: 1, gain: 1, loss: 1 }

  track.addLocations(opts.distance)
  if (clean) track.cleanUp()
  track.addGrades()
  track.calcStats(false)

  // if specifying other distance, scale distances:
  if (opts?.gain !== undefined && opts?.loss !== undefined) {
    track.scales.gain = opts.gain / track.stats.gain
    track.scales.loss = opts.loss / track.stats.loss
    track.scales.grade = (opts.gain - opts.loss) / (track.stats.gain - track.stats.loss)

    track.forEach((x) => {
      x.grade *= (x.grade > 0 ? track.scales.gain : track.scales.loss)
    })
  }

  return track
}

exports.Track = Track
exports.create = create
