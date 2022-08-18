class Segment {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  get name () {
    return this.waypoint ? this.waypoint.name : ''
  }

  get pace () {
    return this.time / this.len
  }

  // time based fields require associated point1 & point2
  get elapsed () { return this.point2.elapsed }
  get time () { return this.point2.time - this.point1.time }
  get tod () { return this.point2.tod }
}

module.exports = Segment
