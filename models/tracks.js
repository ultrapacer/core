const _ = require('lodash')
const { round, interp, wlslr } = require('../util/math')
const { latlon: LatLon } = require('sgeo')
const { Point, interpolatePoint } = require('./points')

class Track {
  constructor (arg) {
    Object.assign(this, arg)
  }

  addLocations () {
    let d = 0
    let l = 0
    this.points[0].loc = 0
    for (let i = 1, il = this.points.length; i < il; i++) {
      d = Number(this.points[i - 1].latlon.distanceTo(this.points[i].latlon))
      l += d
      this.points[i].loc = l
    }
  }

  cleanUp () {
    // function fixes issues with tracks

    // REMOVE ALITITUDE STEPS FROM THE GPX. HAPPENS SOMETIMES WITH STRAVA DEM
    const at = 20 // meters step size
    const gt = 200 // % grade
    let i = 0
    // create array of step indices
    const steps = []
    let dloc = 0
    for (let i = 1, il = this.points.length; i < il; i++) {
      dloc = this.points[i].loc - this.points[i - 1].loc
      if (
        Math.abs((this.points[i].alt - this.points[i - 1].alt)) > at ||
        Math.abs((this.points[i].alt - this.points[i - 1].alt) / dloc / 10) > gt
      ) {
        steps.push(i)
      }
    }
    // for each step, find extents of adjacent flat sections and interp new alt
    steps.forEach(s => {
      let a = s - 1
      while (a >= 0 && this.points[s - 1].alt === this.points[a].alt) { a -= 1 }
      a += 1
      let z = s
      while (z <= this.points.length - 1 && this.points[s].alt === this.points[z].alt) { z += 1 }
      z -= 1
      if (z - a > 1) {
        for (i = a + 1; i < z; i++) {
          this.points[i].alt = interp(
            this.points[a].loc,
            this.points[z].loc,
            this.points[a].alt,
            this.points[z].alt,
            this.points[i].loc
          )
        }
      }
    }
    )
  }

  addGrades () {
    // add grade field to points array
    const locs = []
    let i = 0
    for (i = 0; i < this.points.length; i++) {
      locs.push(this.points[i].loc)
    }
    const lsq = this.getSmoothedProfile(locs, 0.05)
    this.points.forEach((p, i) => {
      p.grade = round(lsq[i].grade, 4)
    })
  }

  calcStats () {
    // return course { gain, loss, dist }
    const d = _.last(this.points).loc
    let gain = 0
    let loss = 0
    let delta = 0
    let last = this.points[0].alt
    this.points.forEach(p => {
      delta = p.alt - last
      if (delta < 0) {
        loss += delta
      } else {
        gain += delta
      }
      last = p.alt
    })
    const stats = {
      gain,
      loss,
      dist: d
    }
    ;({ dist: this.dist, gain: this.gain, loss: this.loss } = stats)
    return stats
  }

  // get lat, lon, alt, index for distance location(s) along track
  getLLA (location, opts = {}) {
    // location : distance or array of distances in km
    // opts :
    //   start : optional start index to speed up search; only for single location

    // if location is already array, copy, otherwise make it one:
    const isArray = Array.isArray(location)
    const locs = isArray ? [...location] : [location]

    // if track has loops, just look at location within first loop (eg track)
    locs.forEach((l, i) => { if (l > this.dist) locs[i] = l % this.dist })

    // initialize variables:
    // start at 0 or at input start point (for single location)
    let i = locs.length === 1 && opts.start && opts.start < this.points.length - 1 ? opts.start : 0

    // determine which way to look
    const back = Boolean(i && this.points[i].loc > locs[0])

    const llas = []
    const il = this.points.length - 1
    location = locs.shift()
    function prev (i) { return back ? i + 1 : i - 1 }

    while (i <= il && i >= 0) {
      if (
        (!back && (i === il || this.points[i].loc >= location)) ||
        (back && (i === 0 || this.points[i].loc <= location))
      ) {
        if (this.points[i].loc === location || (!back && i === il) || (back && i === 0)) {
          llas.push({
            lat: this.points[i].lat,
            lon: this.points[i].lon,
            alt: this.points[i].alt,
            grade: this.points[i].grade,
            ind: i
          })
        } else {
          const p3 = interpolatePoint(this.points[prev(i)], this.points[i], location)
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
    // iterate to new location based on waypoint lat/lon
    // latlon: sgeo LatLon object
    // start: starting point in current track
    // limit: max distance it can move
    const steps = 5
    let jj = this.points.findIndex(p => p === start)
    let p = this.points[jj]
    let min = 0

    while (limit > 0.025) {
      const size = limit / steps
      const ps = [p]

      // loop thru incremental steps:
      for (let i = 1; i <= steps; i++) {
        const l = p.loc + (size * i)
        if (l <= this.dist) {
          while (this.points[jj + 1].loc < l && jj < this.points.length - 1) {
            jj++
          }
          ps.push(this.points[jj])
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

  getNearestLoc (ll, start = null, limit) {
    // iterate to new location based on waypoint lat/lon
    // ll: [lat, lon] array
    // start: starting location in meters
    // limit: max distance it can move
    const steps = 5
    const LLA1 = new LatLon(ll[0], ll[1])

    let min, loc
    const iterateLoc = (start, limit) => {
      loc = start
      while (limit > 0.025) {
        const size = limit / steps
        let locs = []

        for (let i = -steps; i <= steps; i++) {
          const l = loc + (size * i)
          if (l > 0 && l <= this.dist) {
            locs.push(Math.max(0, Math.min(l, this.dist)))
          }
        }
        locs = locs.filter((v, i, s) => s.indexOf(v) === i)

        const llas = this.getLLA(locs)
        llas.forEach(lla => {
          const LLA2 = new LatLon(lla.lat, lla.lon)
          lla.dist = Number(LLA1.distanceTo(LLA2))
        })
        min = llas.reduce((min, b) => Math.min(min, b.dist), llas[0].dist)
        const j = llas.findIndex(x => x.dist === min)
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

  getSmoothedProfile (locs, gt) {
    // locs: array of locations (km)
    // gt: grade smoothing threshold

    const mbs = wlslr(
      this.points.map(p => { return p.loc }),
      this.points.map(p => { return p.alt }),
      locs,
      gt
    )
    const ga = []
    locs.forEach((x, i) => {
      let grade = mbs[i][0] / 10
      if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
      const alt = (x * mbs[i][0]) + mbs[i][1]
      ga.push({
        grade,
        alt
      })
    })
    return ga
  }

  async reduceDensity () {
    // reduce density of points for processing
    // correct distance
    const spacing = 0.025 // meters between points

    // only reformat if it cuts the size down in half
    if (this.dist / spacing < this.points.length / 2) {
      const len = this.dist
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

      return track
    } else {
      return this
    }
  }
}

async function create (arr, opts = {}) {
  const clean = opts.clean !== false // default to true
  let points = arr.map(p => { return new Point(p) })

  if (clean) {
    points = points.filter((p, i) =>
      i === 0 ||
      round(p.lat - points[i - 1].lat, 8) !== 0 ||
      round(p.lon - points[i - 1].lon, 8) !== 0
    )
  }

  // add all points to this
  const track = new Track({ points })

  track.addLocations()
  if (clean) track.cleanUp()
  track.addGrades()
  track.calcStats(false)

  return track
}

exports.Track = Track
exports.create = create
