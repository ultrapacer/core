const suncalc = require('suncalc')
const { round } = require('../util/math')

class Event {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  // lat and lon fields must be set before setting start
  set start (val) {
    this.startDate = new Date(val)

    const midnight = new Date(this.startDate)
    midnight.setHours(0, 0, 0, 0)
    this.midnightSeconds = midnight.getTime() / 1000

    this.startTime = round(this.startDate.getTime() / 1000, 0) - this.midnightSeconds

    this.updateSunEvents()
  }

  get start () {
    return this.startDate
  }

  get hasTOD () {
    return Boolean(this.startDate instanceof Date && !isNaN(this.startDate))
  }

  updateSunEvents () {
    const times = suncalc.getTimes(this.startDate, this.lat, this.lon)
    const nadirPosition = suncalc.getPosition(times.nadir, this.lat, this.lon)

    // add data to sun object, each in seconds since midnight:
    this.sun = {}
    const keys = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'solarNoon']
    keys.forEach(k => {
      if (!isNaN(times[k])) {
        this.sun[k] = round(times[k].getTime() / 1000, 0) - this.midnightSeconds
      }
    })
    this.sun.nadirAltitude = nadirPosition.altitude * 180 / Math.PI
  }
}

module.exports = Event
