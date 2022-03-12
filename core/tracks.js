const { round, interp, wlslr } = require('./math')
const gpxParse = require('gpx-parse')
const logger = require('winston').child({ file: 'tracks.js' })
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

  addLocations () {
    logger.child({ method: 'Track.addLocations' }).info('started')
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
  }

  cleanUp () {
    const log = logger.child({ method: 'Track.cleanup' })
    log.info('started')
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
        log.info(`fixing altitude step at ${round(this[s].loc, 2)} km from ${round(this[a].alt, 2)} m to ${round(this[z].alt, 2)} m`)
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
    logger.child({ method: 'Track.addGrades' }).verbose('executed')
    const locs = Array(...this).map(x => x.loc)
    const lsq = this.getSmoothedProfile(locs, 0.05)
    this.forEach((p, i) => {
      p.grade = round(lsq[i].grade, 4)
    })
  }

  calcStats () {
    // return course { gain, loss, dist }
    const log = logger.child({ method: 'Track.calcStats' })
    const d = this.last.loc
    let gain = 0
    let loss = 0
    let delta = 0
    let last = this[0].alt
    this.forEach(p => {
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
    ;({ dist: this.dist, gain: this.gain, loss: this.loss } = stats)
    log.info(`${round(stats.dist, 2)} km ${round(stats.gain, 0)}/${round(stats.loss, 0)} m`)
    return stats
  }

  // get lat, lon, alt, index for distance location(s) along track
  getLLA (location, opts = {}) {
    // location : distance or array of distances in km
    // opts :
    //   start : optional start index to speed up search; only for single location
    const log = logger.child({ method: 'Track.calcStats' })

    // if location is already array, copy, otherwise make it one:
    const isArray = Array.isArray(location)
    const locs = isArray ? [...location] : [location]

    log.verbose(`Executed for ${locs.length} location(s).`)

    // if track has loops, just look at location within first loop (eg track)
    locs.forEach((l, i) => { if (l > this.dist) locs[i] = l % this.dist })

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
    return isArray ? llas : llas[0]
  }

  getNearestPoint (latlon, start, limit) {
    logger.child({ method: 'Track.getNearestPoint' }).verbose([start._index, limit])
    // iterate to new location based on waypoint lat/lon
    // latlon: sgeo LatLon object
    // start: starting point in current track
    // limit: max distance it can move
    const steps = 5
    let p = this[start._index]
    let jj = start._index
    let min = 0

    while (limit > 0.025) {
      const size = limit / steps
      const ps = [p]

      // loop thru incremental steps:
      for (let i = 1; i <= steps; i++) {
        const l = p.loc + (size * i)
        if (l <= this.last.loc) {
          while (this[jj + 1].loc < l && jj < this.length - 1) {
            jj++
          }
          if (jj > ps[ps.length - 1]._index) ps.push(this[jj])
        }
      }

      // get an array of distances from reference latlon:
      const dists = ps.map(x => {
        return Number(latlon.distanceTo(x.latlon))
      })

      // find the minimum distance:
      min = Math.min(...dists)
      const imin = dists.findIndex(d => d === min)

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

  getNearestLoc (ll, start, limit) {
    logger.child({ method: 'Track.getNearestLoc' }).verbose('run')
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
    logger.child({ method: 'Track.getSmoothedProfile' }).verbose('executed')

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

  async reduceDensity () {
  // reduce density of points for processing
  // correct distance
    const log = logger.child({ method: 'Track|reduceDensity' })
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
      const track = await create(
        llas.map((lla, i) => {
          return [
            round(lla.lat, 6),
            round(lla.lon, 6),
            round(adj[i].alt, 2)
          ]
        }),
        { clean: false }
      )

      log.info(`Reduced from ${this.length} to ${track.length} points`)
      return track
    } else {
      log.info('Reduction not required')
      return this
    }
  }
}

async function create (arr, opts = {}) {
  const log = logger.child({ method: 'create' })

  const clean = opts.clean !== false // default to true
  log.info(`${arr.length} points. clean=${clean}.`)
  let points = arr.map(p => { return new Point(p) })

  if (clean) {
    const prev = points.length
    points = points.filter((p, i) =>
      i === 0 ||
      round(p.lat - points[i - 1].lat, 8) !== 0 ||
      round(p.lon - points[i - 1].lon, 8) !== 0
    )
    if (prev > points.length) {
      log.info(`Removed ${prev - points.length} zero-distance points`)
    }
  }

  // add all points to this
  const track = new Track(points.length)

  // populate track points
  for (let i = 0; i < points.length; i++) {
    track[i] = points[i]
    track[i]._index = i
  }

  track.addLocations()
  if (clean) track.cleanUp()
  track.addGrades()
  track.calcStats(false)

  return track
}

exports.Track = Track
exports.create = create
