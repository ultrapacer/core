import _ from 'lodash'

import { createDebug } from '../debug'
import { MissingDataError } from '../util/MissingDataError'
import { Course } from './Course'
import { Waypoint } from './Waypoint'

const d = createDebug('models:Waypoint')

type WaypointCutoff = { loop: number; time: number }

export class Site {
  private _waypoints?: Waypoint[]
  private _lat?: number
  private _lon?: number
  private _alt?: number

  constructor(
    course: Course,
    data: {
      _id: string
      type: string
      name: string
      description?: string
      cutoffs?: WaypointCutoff[]
      percent: number
      tier?: number
      terrainFactor?: number
      terrainType?: string
      crew?: boolean
      dropbags?: boolean
    }
  ) {
    this._data = { percent: data.percent }

    this.course = course

    this._id = data._id
    this.type = data.type
    this.name = data.name
    if (data.cutoffs) this.cutoffs = data.cutoffs
    if (data.tier !== undefined) this.tier = data.tier
    if (data.terrainFactor !== undefined) this.terrainFactor = data.terrainFactor
    if (data.terrainType !== undefined) this.terrainType = data.terrainType
    if (data.description) this.description = data.description
    this.crew = data.crew || false
    this.dropbags = data.dropbags || false

    d(`constructor: ${this.name}`)
  }

  _data: {
    percent: number
  }
  _id: string
  course: Course
  cutoffs: WaypointCutoff[] = []
  name: string
  tier: number = 1
  type: string
  terrainFactor?: number
  terrainType?: string
  description?: string
  pointsIndex?: number
  dropbags: boolean
  crew: boolean

  clearCache() {
    d(`clearCache: ${this.name}`)
    delete this._waypoints
    delete this._lat
    delete this._lon
    delete this._alt
  }

  get percent() {
    switch (this.type) {
      case 'start':
        return 0
      case 'finish':
        return 1
      default:
        return this._data.percent
    }
  }

  set percent(v) {
    this._data.percent = v
  }

  get waypoints() {
    if (this._waypoints) return this._waypoints
    d(`generating waypoints array: ${this.name}`)
    if (this.type === 'finish') {
      this._waypoints = [new Waypoint(this, this.course.loops)]
    } else {
      this._waypoints = _.range(this.course.loops).map((x) => new Waypoint(this, x + 1))
    }
    return this._waypoints
  }

  get lat() {
    if (!this._lat) this.refreshLLA()
    return this._lat
  }

  get lon() {
    if (!this._lon) this.refreshLLA()
    return this._lon
  }

  get alt() {
    if (!this._alt) this.refreshLLA()
    return this._alt
  }

  // function updates the lat/lon/alt of a waypoint
  refreshLLA() {
    d('refreshLLA')

    if (!this.course?.track?.points?.length)
      throw new MissingDataError('No track points defined', 'points')

    let lat, lon, alt, ind

    // if start use start lla
    if (this.type === 'start') {
      ;({ lat, lon, alt } = this.course.track.points[0])

      // if finish use finish lla
    } else if (this.type === 'finish') {
      ;({ lat, lon, alt } = this.course.track.points[this.course.track.points.length - 1])

      // otherwise interpolate the lla from track array
    } else {
      ;({ lat, lon, alt } = this.course.track.getLLA(this.percent * this.course.track.dist))
    }
    // update site values
    this._lat = lat
    this._lon = lon
    this._alt = alt
    if (ind) this.pointsIndex = ind

    // TODO. clearing splits; not sure if this is the best place to put this
    this.course.clearCache(1)
  }

  serialize() {
    d(`serialize: ${this.name}`)
    const fields = Object.keys(this)
    fields.push('percent')
    return _.pick(this, fields)
  }
}
