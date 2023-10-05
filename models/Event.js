import _ from 'lodash'
import suncalc from 'suncalc'
import { dateToTODSeconds } from '../util/dateToTODSeconds.js'

const { getTimes, getPosition } = suncalc

export class Event {
  constructor(obj) {
    Object.defineProperty(this, '_cache', { value: {} })
    Object.defineProperty(this, '_data', { value: {} })

    Object.assign(this, obj)
  }

  // lat and lon fields must be set before setting start
  set start(val) {
    this._data.start = val

    // clear cached data
    Object.keys(this._cache).forEach((key) => {
      delete this._cache[key]
    })
  }

  get start() {
    return this._data.start
  }

  get startTime() {
    if (_.isNumber(this._cache.startTime)) return this._cache.startTime
    this._cache.startTime = dateToTODSeconds(this.start, this.timezone)
    return this._cache.startTime
  }

  get hasTOD() {
    return Boolean(this.start instanceof Date && !isNaN(this.start))
  }

  get sun() {
    if (this._cache.sun) return this._cache.sun

    const times = getTimes(this.start, this.lat, this.lon)
    const nadirPosition = getPosition(times.nadir, this.lat, this.lon)

    // add data to sun object, each in seconds since midnight:
    const sun = {}

    // names of keys from suncalc
    const keys = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'solarNoon']

    // names to map for ultrapacer
    const keys2 = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'noon']

    // set values in sun object
    keys.forEach((k, i) => {
      if (!isNaN(times[k])) {
        sun[keys2[i]] = dateToTODSeconds(times[k], this.timezone)
      }
    })

    sun.nadirAltitude = (nadirPosition.altitude * 180) / Math.PI

    this._cache.sun = sun

    return this._cache.sun
  }

  // return a date object at [seconds] from start
  dateAtElapsed(seconds) {
    const d = new Date(this.start)
    d.setTime(d.getTime() + seconds * 1000)
    return d
  }

  // return seconds since midnight for an input elapsed amount of time since start
  elapsedToTimeOfDay(elapsed) {
    return (this.startTime + elapsed) % 86400
  }

  // return static object
  serialize() {
    return _.pick(this, ['start', 'sun', 'lat', 'lon', 'timezone'])
  }
}
