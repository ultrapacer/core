import { getPosition, getTimes } from 'suncalc'

import { Types } from '../main'
import { dateToTODSeconds } from '../util/dateToTODSeconds'

class SunEvents implements Types.SunEvents {
  readonly nadir: Types.SunEvent
  readonly dawn: Types.SunEvent | null
  readonly sunrise: Types.SunEvent | null
  readonly dusk: Types.SunEvent | null
  readonly sunset: Types.SunEvent | null
  readonly noon: Types.SunEvent

  constructor(obj: Types.SunEvents) {
    this.nadir = obj.nadir
    this.dawn = obj.dawn
    this.sunrise = obj.sunrise
    this.dusk = obj.dusk
    this.sunset = obj.sunset
    this.noon = obj.noon
  }
}

export class Event implements Types.Event {
  readonly start: Date
  readonly lat: number
  readonly lon: number
  readonly timezone: string
  readonly sun: Types.SunEvents
  private readonly startTime: number

  constructor(start: Date, timezone: string, lat: number, lon: number) {
    this.start = start
    this.lat = lat
    this.lon = lon
    this.timezone = timezone

    const times = getTimes(this.start, this.lat, this.lon)

    const f1 = (date: Date) => ({
      altitude: (getPosition(date, this.lat, this.lon).altitude * 180) / Math.PI,
      time: dateToTODSeconds(date, this.timezone)
    })
    const f2 = (date: Date) => (date.getTime() > 0 ? f1(date) : null)

    this.sun = new SunEvents({
      nadir: f1(times.nadir),
      dawn: f2(times.dawn),
      sunrise: f2(times.sunrise),
      sunset: f2(times.sunset),
      dusk: f2(times.dusk),
      noon: f1(times.solarNoon)
    })

    this.startTime = dateToTODSeconds(this.start, this.timezone)
  }

  dateAtElapsed(seconds: number): Date {
    const d = new Date(this.start)
    d.setTime(d.getTime() + seconds * 1000)
    return d
  }

  elapsedToTimeOfDay(elapsed: number): number {
    return (this.startTime + elapsed) % 86400
  }
}
