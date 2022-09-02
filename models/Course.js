const { isNumeric, interp, req, rgte } = require('../util/math')
const areSame = require('../util/areSame')
const { sleep } = require('../util')
const { interpolatePoint } = require('./points')
const Waypoint = require('./Waypoint')
const Event = require('./Event')
const Segment = require('./Segment')
const { createSegments, createSplits } = require('../geo')

class CoursePoint {
  constructor (course, point, loop) {
    this.point = point
    this.course = course
    this.loop = loop
  }

  get lat () { return this.point.lat }
  get lon () { return this.point.lon }
  get alt () { return this.point.alt }
  get latlon () { return this.point.latlon } // sgeo latlon object
  get grade () { return this.point.grade }

  get loc () {
    let l = this.point.loc
    if (this.loop) l += this.course.track.dist * this.loop
    return l
  }

  has (field) {
    return isNumeric(this[field])
  }
}

class Course {
  constructor (db) {
    this.db = db

    // waypoints array gets populated by set sites()
    this.waypoints = []

    // other fields just pass along:
    Object.keys(db).forEach(k => {
      if (this[k] === undefined) this[k] = db[k]
    })

    this.sites = db.sites

    // create event property:
    if (this.waypoints?.length) {
      const s = this.waypoints.find(wp => wp.type === 'start' && wp.loop === 1)
      this.event = new Event({
        lat: s.lat,
        lon: s.lon
      })
      if (db.eventStart) {
        this.event.timezone = db.eventTimezone
        this.event.start = db.eventStart
      }
    }

    // use cached splits if input:
    if (db.cache) {
      // add splits, and make sure each is casted as a Segment
      this.splits = {}
      const types = ['segments', 'miles', 'kilometers']
      types.forEach(type => {
        this.splits[type] = db.cache[type].map(s => new Segment(s))
      })

      // sync waypoint objects
      if (this.waypoints?.length && this.splits.segments?.length) {
        this.splits.segments.forEach(s => {
          const wp = this.waypoints.find(
            wp => areSame(wp.site, s.waypoint.site) && wp.loop === s.waypoint.loop
          )
          if (wp) s.waypoint = wp
        })
      }
    }
  }

  get loops () { return this.db?.loops || 1 }
  set loops (v) { this.db.loops = v }

  get dist () { return this.trackDist * this.loops }
  get gain () { return this.trackGain * this.loops }
  get loss () { return this.trackLoss * this.loops }

  get trackDist () { return this.track?.dist || this.db.distance }
  get trackGain () { return this.track?.gain || this.db.gain }
  get trackLoss () { return this.track?.loss || this.db.loss }

  get distScale () { return this.db.override?.dist ? this.db.override.dist / this.trackDist : 1 }
  get gainScale () { return this.db.override?.gain ? this.db.override.gain / this.trackGain : 1 }
  get lossScale () { return this.db.override?.loss ? this.db.override.loss / this.trackLoss : 1 }

  get scaledDist () { return this.dist * this.distScale }
  get scaledGain () { return this.gain * this.gainScale }
  get scaledLoss () { return this.loss * this.lossScale }

  // create waypoints from sites:
  set sites (data) {
    if (!data?.length) {
      this.waypoints = []
      return
    }

    let wps = []
    for (let i = 1; i <= this.loops; i++) {
      wps.push(
        ...data.map(
          site => {
            return new Waypoint(site, this, i)
          }
        )
      )
    }
    wps = wps
      .sort((a, b) => a.loc - b.loc)
      .filter(wp => wp.loop === this.loops || wp.type !== 'finish')
    this.waypoints = wps

    if (this.track?.constructor?.name === 'Track') {
      this.refreshWaypointLLAs()
    }

    this.refreshTerrainFactors()
    this.refreshCutoffs()
  }

  get sites () {
    return this.waypoints?.filter(wp => wp.loop === 1 || wp.type === 'finish').map(wp => wp.site) || []
  }

  // add track to course and create points array:
  addTrack (track) {
    this.track = track
    this.points = new Array(track.length * this.loops)
    for (let l = 0; l < this.loops; l++) {
      for (let i = 0; i < track.length; i++) {
        this.points[i + l * track.length] = new CoursePoint(this, track[i], l)
      }
    }

    // update course db stats from track:
    this.db.distance = this.track.dist
    this.db.gain = this.track.gain
    this.db.loss = this.track.loss

    // refresh waypoint LLAs after adding track
    this.refreshWaypointLLAs()
  }

  // ROUTINE TO EITHER RETURN EXISTING POINT AT LOCATION OR INSERT IT, THEN RETURN
  insertPoint (loc) {
    const i3 = this.points.findIndex(p => rgte(p.loc, loc, 4))
    const p3 = this.points[i3]

    // if point exists, return it
    if (req(p3.loc, loc, 4)) {
      return p3
    }

    // add point and return it
    const i1 = i3 - 1
    const p1 = this.points[i1]
    const p2 = new CoursePoint(this, interpolatePoint(p1, p3, loc), Math.floor(loc / this.dist))

    // add in interpolated time values if they exist
    if (!isNaN(p1.time) && !isNaN(p3.time)) {
      const delay = (p3.elapsed - p3.time) - (p1.elapsed - p1.time)
      p2.time = interp(p1.loc, p3.loc, p1.time + delay, p3.time, p3.loc)
      p2.elapsed = p3.elapsed - (p3.time - p2.time)
      if (!isNaN(p1.tod) && !isNaN(p3.tod)) {
        p2.tod = (p3.tod - (p3.time - p2.time) + 86400) % 86400
      }
    }

    this.points.splice(i3, 0, p2)
    return p2
  }

  // map array of actual times to this
  async addActuals (actual) {
    // where actual is an array of Points or CoursePoints
    if (!this.points?.length) { throw new Error('Course has no points array') }

    // init variables
    let delta = 0
    let lastGoodPoint = {}
    let a = actual[0]

    for (let index = 0; index < this.points.length; index++) {
      // breakup processing to not hang browser
      if (index % 20 === 0) await sleep(10)

      // set current point
      const p = this.points[index]

      // limit for search gets bigger as error grows
      const limit = Math.max(0.1, Number(p.latlon.distanceTo(a.latlon)) * 1.1)

      // resolve closest point on actual track to current course point
      ;({ point: a, delta } = actual.getNearestPoint(p.latlon, a, limit))

      // keep track of last good match
      if (delta < 0.1) lastGoodPoint = p

      // if you ever get more than 2km offtrack, return match fail:
      if (delta > 2) {
        return {
          match: false,
          point: lastGoodPoint
        }
      }

      // set the actual for point
      p.actual = a
    }
    return {
      match: true
    }
  }

  refreshWaypointLLAs () {
    this.waypoints
      .filter(wp => wp.loop === 1 || wp.type === 'finish')
      .forEach(wp => { wp.refreshLLA() })
  }

  refreshTerrainFactors () {
    let tF = this.waypoints[0].terrainFactor()
    let tT = this.waypoints[0].terrainType()
    this.terrainFactors = this.waypoints.filter((x, i) => i < this.waypoints.length - 1).map((x, i) => {
      if (x.terrainFactor() !== null) tF = x.terrainFactor()
      if (x.terrainType() !== null) tT = x.terrainType()
      return new TerrainFactor({
        startWaypoint: x,
        endWaypoint: this.waypoints[i + 1],
        tF,
        type: tT
      })
    })
  }

  refreshCutoffs () {
    this.cutoffs = this.waypoints
      .filter(wp => wp.cutoff)
      .map(wp => new CourseCutoff({ waypoint: wp }))
  }

  // calculate and return splits for course
  async calcSplits () {
    const splits = {}
    splits.segments = await createSegments(
      this.points,
      {
        waypoints: this.waypoints,
        course: this
      }
    )
    const units = ['kilometers', 'miles']
    await Promise.all(
      units.map(async (unit) => {
        splits[unit] = await createSplits(
          this.points,
          unit,
          {
            course: this
          }
        )
      })
    )
    this.splits = splits
    return this.splits
  }
}

class CourseCutoff {
  constructor (data) {
    Object.assign(this, data)
  }

  get loc () { return this.waypoint.loc }
  get time () { return this.waypoint.cutoff }
}

class TerrainFactor {
  constructor (data) {
    Object.assign(this, data)
  }

  get start () { return this.startWaypoint.loc }
  get end () { return this.endWaypoint.loc }
}

module.exports = Course
