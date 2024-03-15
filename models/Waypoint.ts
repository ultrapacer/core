import _ from 'lodash'

import { areSameWaypoint } from '../util/areSameWaypoint'
import { CourseSegment, PlanSegment } from './Segment'
import { Site } from './Site'

export class Waypoint {
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
    if (this.loop >= 2 && this.type !== 'finish') {
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
    if (this.type === 'start') {
      this.site.percent = 0
    } else if (this.type === 'finish') {
      this.site.percent = 1
    } else {
      this.site.percent = (v / this.course.loopDist) % 1
    }
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

  get tier() {
    return this.site.tier || 1
  }
  get type() {
    return this.site.type
  }

  get dropbags() {
    return this.site.dropbags || false
  }
  set dropbags(v) {
    this.site.dropbags = Boolean(v)
  }

  get crew() {
    return this.site.crew || false
  }
  set crew(v) {
    this.site.crew = Boolean(v)
  }

  get terrainFactor() {
    return this.site.terrainFactor
  }
  get terrainType() {
    return this.site.terrainType
  }

  get hasTypicalDelay() {
    return Boolean(
      this.type === 'aid' || this.type === 'water' || (this.loop >= 2 && this.type === 'start')
    )
  }

  get cutoff() {
    // getting cutoff retrieves from array of {time, loop} items
    if (this.tier === 1) {
      const v = this.site.cutoffs?.find((c) => c.loop === this.loop)
      if (v) {
        return v.time
      }
    }
    return null
  }

  set cutoff(v) {
    // setting a cutoff updates or removes that item from array on db item

    // find index of cutoff if it already exists
    const i = this.site.cutoffs?.findIndex((c) => c.loop === this.loop)

    // if it already exists, update or remove it
    if (i >= 0) {
      if (v) {
        this.site.cutoffs[i].time = v
      } else {
        this.site.cutoffs.splice(i, 1)
      }

      // otherwise add a new one
    } else if (v) {
      if (!this.site.cutoffs) {
        this.site.cutoffs = []
      }
      this.site.cutoffs.push({ time: v, loop: this.loop })
    }
  }

  matchingSegment(segments: CourseSegment[]): CourseSegment | PlanSegment | undefined {
    return segments.find((s) => s.waypoint && areSameWaypoint(this, s.waypoint))
  }

  serialize() {
    const data = _.pick(this, [
      'loop',
      'name',
      'type',
      'cutoff',
      'loc',
      'lat',
      'lon',
      'alt',
      'tier',
      'crew',
      'dropbags',
      'terrainType',
      'terrainFactor'
    ])

    return { ...data, site: this.site._id }
  }
}
