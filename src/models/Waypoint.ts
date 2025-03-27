import _ from 'lodash'

import { Types } from '../main'
import { Site } from './Site'

export class Waypoint implements Types.Waypoint {
  constructor(site: Site, loop: number = 1) {
    this._data = {}
    this.site = site
    this.loop = loop
  }

  _data: object
  loop: number
  site: Site

  get course() {
    return this.site.course
  }

  get name() {
    if (this.loop >= 2 && !this.isFinish) {
      return `${this.site.name} ${this.loop}`
    } else {
      return this.site.name
    }
  }

  get description() {
    return this.site.description
  }

  get loc() {
    return (this.site.percent + this.loop - 1) * this.course.loopDist
  }

  set loc(v) {
    if (!_.isNumber(v)) throw new Error('Wrong format for Waypoint.loc')

    if (this.isStart || this.isFinish) {
      console.warn('Cannot set loc for start or finish waypoint')
      return
    }

    this.site.percent = (v / this.course.loopDist) % 1
  }

  get lat() {
    return this.site.lat
  }

  get lon() {
    return this.site.lon
  }

  get alt() {
    return this.site.alt
  }

  get hasDelay() {
    if (this.isStart) return false
    return this.site.hasDelay
  }

  get isFinish() {
    return this.site.isFinish
  }

  get isStart() {
    return this.site.isStart && this.loop === 1
  }

  get cutoff() {
    return this.site.cutoffs?.find((c) => c.loop === this.loop)?.time
  }
}
