import _ from 'lodash'

import { createDebug } from '../debug'
import { Types } from '../main'
import { Waypoint } from './Waypoint'

const d = createDebug('models:Waypoint')

export class Site implements Types.Site {
  /**
   * internal cache object
   * gets deleted and regenerated when version changes
   */
  private _cache: {
    _version?: number
    alt?: number
    lat?: number
    lon?: number
    waypoints?: Types.Waypoint[]
  } = {}
  get cache() {
    if (this._cache?._version === this.version) return this._cache
    this._cache = { _version: this.version }
    return this._cache
  }

  /**
   * internal data object
   */
  private _data: Types.SiteData

  get alt() {
    if ('alt' in this._cache) return this._cache.alt
    this.refreshLLA()
    return Number(this._cache.alt)
  }

  readonly course: Types.Course

  get cutoffs() {
    return this._data.cutoffs || []
  }

  get description() {
    return this._data.description
  }

  get hasDelay() {
    return this._data.hasDelay
  }

  get id() {
    return this._data.id
  }

  get isFinish() {
    return this._data.isFinish
  }

  get isStart() {
    return this._data.isStart
  }

  get lat() {
    if ('lat' in this._cache) return this._cache.lat
    this.refreshLLA()
    return Number(this._cache.lat)
  }

  get lon() {
    if ('lon' in this._cache) return this._cache.lon
    this.refreshLLA()
    return Number(this._cache.lon)
  }

  get name() {
    return this._data.name
  }

  get percent() {
    if (this.isStart) return 0
    if (this.isFinish) return 1
    return this._data.percent
  }
  set percent(v) {
    this._data.percent = v
  }

  get version() {
    return this.course.version
  }

  get waypoints(): Types.Waypoint[] {
    if ('waypoints' in this._cache) return this._cache.waypoints

    d(`generating waypoints array: ${this.name}`)
    if (this.isFinish) {
      this._cache.waypoints = [new Waypoint(this, this.course.loops)]
    } else {
      this._cache.waypoints = _.range(this.course.loops).map((x) => new Waypoint(this, x + 1))
    }
    return this._cache.waypoints
  }

  constructor(course: Types.Course, data: Types.SiteData) {
    this.course = course
    this._data = data
  }

  refreshLLA() {
    d('refreshLLA')

    let lat, lon, alt

    // if start use start lla
    if (this.isStart) {
      ;({ lat, lon, alt } = this.course.track.points[0])

      // if finish use finish lla
    } else if (this.isFinish) {
      ;({ lat, lon, alt } = this.course.track.points[this.course.track.points.length - 1])

      // otherwise interpolate the lla from track array
    } else {
      ;({ lat, lon, alt } = this.course.track.getLLA(this.percent * this.course.track.dist))
    }
    // update site values
    this._cache.lat = lat
    this._cache.lon = lon
    this._cache.alt = alt
  }
}
