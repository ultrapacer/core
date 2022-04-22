const { isNumeric } = require('../util/math')
const { sleep } = require('../util')

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
}

module.exports = {
  Course: Course
}
