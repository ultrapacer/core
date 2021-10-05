const { isNumeric, interp } = require('./math')
const { sleep } = require('./util')
const { logger } = require('./logger')

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
  get dloc () { return this.point.dloc }
  get loc () { return this.point.loc + (this.course.track.dist * this.loop) }

  has (field) {
    return isNumeric(this[field])
  }
}

class Course {
  constructor (db) {
    this.db = db
    // other fields just pass along:
    Object.keys(db).forEach(k => {
      if (this[k] === undefined) this[k] = db[k]
    })
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
  }

  // map array of actual times to this
  async addActuals (actual) {
    // where actual is an array of Points or CoursePoints
    const t = logger(`Course|addActuals : mapping ${actual.length} points`)
    if (!this.points?.length) { throw new Error('Course has no points array') }

    // shallow copy actual array
    actual = [...actual]

    let MatchFailure = {}
    try {
      for (let index = 0; index < this.points.length; index++) {
        const p = this.points[index]

        // this requires a lot of processing; prevent browser from hanging:
        if (index % 10 === 0) {
          await sleep(5)
        }
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
              return Number(p.latlon.distanceTo(a.latlon))
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
      if (MatchFailure.point) {
        logger('Track|addActuals FAIL', t)
        return MatchFailure
      } else {
        throw e
      }
    }
  }
}

module.exports = {
  Course: Course
}
