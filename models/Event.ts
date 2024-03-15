import _ from 'lodash'
import { getPosition, getTimes } from 'suncalc'

import { dateToTODSeconds } from '../util/dateToTODSeconds'
import { Sun } from './Sun'

class SunEvent {
  nadir: number = 0
  dawn: number = 0
  sunrise: number = 0
  dusk: number = 0
  sunset: number = 0
  noon: number = 0
  nadirAltitude: number = 0

  constructor(obj: SunEvent) {
    Object.assign(this, obj)
  }
}

export class Event {
  readonly start: Date
  readonly lat: number
  readonly lon: number
  readonly timezone: string
  readonly sun: Sun
  readonly startTime: number

  constructor(start: Date, timezone: string, lat: number, lon: number) {
    this.start = start
    this.lat = lat
    this.lon = lon
    this.timezone = timezone

    const times = getTimes(this.start, this.lat, this.lon)
    const nadirPosition = getPosition(times.nadir, this.lat, this.lon)

    this.sun = new SunEvent({
      nadir: dateToTODSeconds(times.nadir, this.timezone),
      dawn: dateToTODSeconds(times.dawn, this.timezone),
      sunrise: dateToTODSeconds(times.sunrise, this.timezone),
      dusk: dateToTODSeconds(times.dusk, this.timezone),
      sunset: dateToTODSeconds(times.sunset, this.timezone),
      noon: dateToTODSeconds(times.solarNoon, this.timezone),
      nadirAltitude: (nadirPosition.altitude * 180) / Math.PI
    })

    this.startTime = dateToTODSeconds(this.start, this.timezone)
  }

  // return a date object at [seconds] from start
  dateAtElapsed(seconds: number): Date {
    const d = new Date(this.start)
    d.setTime(d.getTime() + seconds * 1000)
    return d
  }

  // return seconds since midnight for an input elapsed amount of time since start
  elapsedToTimeOfDay(elapsed: number): number {
    return (this.startTime + elapsed) % 86400
  }

  // return static object
  serialize() {
    return _.pick(this, ['start', 'sun', 'lat', 'lon', 'timezone'])
  }
}
