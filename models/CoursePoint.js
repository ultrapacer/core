const { isNumeric } = require('../util/math')

class CoursePoint {
  constructor(course, point, loop) {
    Object.defineProperty(this, 'course', { writable: true })

    this.point = point
    this.course = course
    this.loop = loop
  }

  get lat() {
    return this.point.lat
  }
  get lon() {
    return this.point.lon
  }
  get alt() {
    return this.point.alt
  }
  get latlon() {
    return this.point.latlon
  } // sgeo latlon object
  get grade() {
    return this.point.grade * (this.point.grade > 0 ? this.course.gainScale : this.course.lossScale)
  }

  get loc() {
    let l = this.point.loc * this.course.distScale
    if (this.loop) l += this.course.loopDist * this.loop
    return l
  }

  has(field) {
    return isNumeric(this[field])
  }
}

module.exports = CoursePoint
