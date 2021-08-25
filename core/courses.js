class Course {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  totalDistance () {
    return this.distance * (this.loops || 1)
  }

  totalGain () {
    return this.gain * (this.loops || 1)
  }

  totalLoss () {
    return this.loss * (this.loops || 1)
  }
}

module.exports = {
  Course: Course
}
