const suncalc = require('suncalc')

class Event {
  constructor (obj) {
    Object.keys(obj).forEach(k => {
      this[k] = obj[k]
    })
  }

  // lat and lon fields must be set before setting start
  set start (val) {
    this.startDate = new Date(val)
    this.startTime = dateToTODSeconds(this.startDate, this.timezone)
    this.updateSunEvents()
  }

  get start () {
    return this.startDate
  }

  get hasTOD () {
    return Boolean(this.startDate instanceof Date && !isNaN(this.startDate))
  }

  // return a date object at [seconds] from start
  dateAtElapsed (seconds) {
    const d = new Date(this.start)
    d.setTime(d.getTime() + (seconds * 1000))
    return d
  }

  updateSunEvents () {
    const times = suncalc.getTimes(this.startDate, this.lat, this.lon)
    const nadirPosition = suncalc.getPosition(times.nadir, this.lat, this.lon)

    // add data to sun object, each in seconds since midnight:
    this.sun = {}

    // names of keys from suncalc
    const keys = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'solarNoon']

    // names to map for ultrapacer
    const keys2 = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'noon']

    // set values in sun object
    keys.forEach((k, i) => {
      if (!isNaN(times[k])) {
        this.sun[keys2[i]] = dateToTODSeconds(times[k], this.timezone)
      }
    })

    this.sun.nadirAltitude = nadirPosition.altitude * 180 / Math.PI
  }
}

// get time of day seconds in event timezone:
function dateToTODSeconds (date, timezone) {
  const hms = date.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone
  }).split(':').map(v => Number(v))
  return hms[0] * 60 * 60 + hms[1] * 60 + hms[2]
}

module.exports = Event
