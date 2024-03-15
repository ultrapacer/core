import _ from 'lodash'

import { createDebug } from '../debug'
import { req, rgte, rlt } from '../util/math'
import { MissingDataError } from '../util/MissingDataError'
import { CoursePoint } from './CoursePoint'
import { CourseSplits } from './CourseSplits'
import { interpolatePoint } from './Points/interpolate'
import { Site } from './Site'
import { Track } from './Track'
import { Waypoint } from './Waypoint'

const d = createDebug('models:Course')

// course constructor will pass through all fields; use
// this array to omit certain keys from passing through
const disallowed = ['track', 'dist', 'gain', 'loss', 'cache', 'distance']

export type CourseData = {
  track: Track
  loops?: number
  dist?: number
  gain?: number
  loss?: number
}

export class Course {
  name?: string
  _cache: {
    terrainTypes?: TerrainType[]
    terrainFactors?: TerrainFactor[]
    splits?: []
    stats?: object
  } = {}

  constructor(data: CourseData) {
    this._track = data.track

    if (data.loops) this.loops = data.loops

    if (data.dist) this._distOverride = data.dist
    if (data.gain) this._gainOverride = data.gain
    if (data.loss) this._lossOverride = data.loss

    // other fields just pass along:
    const keys = Object.keys(data).filter((k) => !disallowed.includes(k))
    Object.assign(this, _.pick(data, keys))
  }

  private _loops: number = 1
  get loops() {
    return this._loops
  }
  set loops(v) {
    this._loops = v
    this.clearCache(2)
  }

  private _distOverride?: number
  private _gainOverride?: number
  private _lossOverride?: number
  private _dist?: number
  private _gain?: number
  private _loss?: number
  set dist(v) {
    d(`overriding dist to ${v}`)
    this._distOverride = v
    this.clearCache(2)
  }
  set gain(v) {
    d(`overriding gain to ${v}`)
    this._gainOverride = v
    this.clearCache(2)
  }
  set loss(v) {
    d(`overriding loss to ${v}`)
    this._lossOverride = v
    this.clearCache(2)
  }
  get dist(): number {
    return this._dist || (this._dist = this._distOverride || this.track.dist * this.loops)
  }
  get gain(): number {
    return this.gain || (this._gain = this._gainOverride || this.track.gain * this.loops)
  }
  get loss(): number {
    return this._loss || (this._loss = this._lossOverride || this.track.loss * this.loops)
  }
  get distScale() {
    return this._distOverride ? this._distOverride / (this.track.dist * this.loops) : 1
  }
  get gainScale() {
    return this._gainOverride ? this._gainOverride / (this.track.gain * this.loops) : 1
  }
  get lossScale() {
    return this._lossOverride ? this._lossOverride / (this.track.loss * this.loops) : 1
  }
  get loopDist() {
    return this.dist / this.loops
  }
  get loopGain() {
    return this.gain / this.loops
  }
  get loopLoss() {
    return this.loss / this.loops
  }

  private _sites: Site[] = [
    new Site(this, {
      _id: String(_.random(10000, 20000)),
      name: 'Start',
      type: 'start',
      percent: 0
    }),
    new Site(this, {
      _id: String(_.random(30000, 40000)),
      name: 'Finish',
      type: 'finish',
      percent: 1
    })
  ]
  get sites() {
    return this._sites
  }
  set sites(data) {
    this._sites = data.map((site) => new Site(this, site))
    this.clearCache(1)
  }

  clearCache(level = 1) {
    // level 1 means route itself does not change (eg, changes to waypoints and trivial changes to course)
    // level 2 means route itself changes (eg, track, loops, dist, gain, loss)
    d(`clearCache-${level}`)

    delete this._cutoffs
    delete this._splits
    delete this._stats
    delete this._terrainFactors
    delete this._terrainTypes
    delete this._waypoints

    if (level === 2) {
      delete this._dist
      delete this._gain
      delete this._loss
      delete this._points
      this.sites.forEach((site) => {
        site.clearCache()
      })
    }
  }

  private _waypoints?: Waypoint[]
  get waypoints(): Waypoint[] {
    if (this._waypoints) return this._waypoints

    if (!this.track?.dist) return []

    let waypoints: Waypoint[] = []
    this.sites.forEach((site) => {
      waypoints.push(...site.waypoints)
    })
    waypoints = waypoints.sort((a, b) => a.loc - b.loc)

    this._waypoints = waypoints
    return this._waypoints
  }

  private _track: Track
  set track(v) {
    this._track = v
    this.clearCache(2)
  }
  get track() {
    return this._track
  }

  private _points?: CoursePoint[]
  get points(): CoursePoint[] {
    if (this._points) return this._points

    d('generating points array')

    if (!this.track?.points?.length)
      throw new MissingDataError('Track points are not defined.', 'points')

    this._points = new Array(this.track.points.length * this.loops)
    for (let l = 0; l < this.loops; l++) {
      for (let i = 0; i < this.track.points.length; i++) {
        this.points[i + l * this.track.points.length] = new CoursePoint(
          this,
          this.track.points[i],
          l
        )
      }
    }

    return this._points
  }

  set points(v) {
    throw new Error('cannot set points directly')
  }

  /**
   * Finds and optionally inserts a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @param insert - Whether to also insert a created point into the points array. Defaults to false.
   * @returns The CoursePoint at input location.
   */
  getPoint(loc: number, insert: boolean = false): CoursePoint {
    const i2 = this.points.findIndex((p) => rgte(p.loc, loc, 4))
    const p2 = this.points[i2]

    // if point exists, return it
    if (req(p2.loc, loc, 4)) return p2

    d(`getPoint: ${insert ? 'inserting' : 'creating'} new CoursePoint at ${loc}`)

    // define first point for interpolation
    const i1 = i2 - 1
    const p1 = this.points[i1]

    // create a new point
    const trackPoint = interpolatePoint(p1.point, p2.point, (loc % this.loopDist) / this.distScale)
    const point = new CoursePoint(this, trackPoint, Math.floor(loc / this.loopDist))

    if (insert) this.points.splice(i2, 0, point)

    return point
  }

  // terrainFactors: array of TerrainFactor objects only where actual terrain factor values exist
  private _terrainFactors?: TerrainFactor[]
  get terrainFactors() {
    if (this._terrainFactors) return this._terrainFactors
    d('regenerating terrainFactors')
    const arr = this.waypoints.filter(
      (x, i) =>
        i === 0 ||
        (!_.isNil(x.terrainFactor) && x.terrainFactor !== this.waypoints[i - 1]?.terrainFactor)
    )
    this._terrainFactors = arr.map((x, i) => {
      return new TerrainFactor(x, arr[i + 1] || _.last(this.waypoints), x.terrainFactor)
    })

    return this._terrainFactors
  }

  // terrainTypes: array of TerrainType objects only where actual terrain type changes exist
  private _terrainTypes?: TerrainType[]
  get terrainTypes() {
    if (this._terrainTypes) return this._terrainTypes
    d('regenerating terrainTypes')
    const arr = this.waypoints.filter(
      (x, i) => !_.isNil(x.terrainType) && x.terrainType !== this.waypoints[i - 1]?.terrainType
    )
    this._terrainTypes = arr.map((x, i) => {
      return new TerrainType(x, arr[i + 1] || _.last(this.waypoints), x.terrainType || '')
    })

    return this._terrainTypes
  }

  private _cutoffs?: CourseCutoff[]
  get cutoffs() {
    if (this._cutoffs) return this._cutoffs

    this._cutoffs = this.waypoints.filter((wp) => wp.cutoff).map((wp) => new CourseCutoff(wp))

    return this._cutoffs
  }

  private _splits?: CourseSplits
  get splits() {
    if (this._splits) return this._splits

    this._splits = new CourseSplits(this)

    return this._splits
  }

  // calculate max and min values along course
  private _stats?: {
    altitude: { avg: number; max: number; min: number }
    grade: { avg: number; max: number; min: number }
    terrain: { avg: number; max: number; min: number; maxDist: number; minDist: number }
  }
  get stats() {
    if (this._stats) return this._stats

    d('stats:calculate')

    const alts = this.track.points.map((p) => p.alt)
    const grades = this.track.points.map((p) => p.grade)
    const terrains = this.terrainFactors.map((tf) => tf.value / 100 + 1)

    const stats = {
      altitude: {
        avg:
          _.sum(
            this.track.points.map((p, i) => p.alt * (p.loc - (this.track.points[i - 1]?.loc || 0)))
          ) / this.track.dist,
        max: _.max(alts) || 0,
        min: _.min(alts) || 0
      },
      grade: {
        avg:
          (this.track.points[this.track.points.length - 1].alt - this.track.points[0].alt) /
          this.track.dist /
          10,
        max: _.max(grades) || 0,
        min: _.min(grades) || 0
      },
      terrain: {
        avg:
          (_.sumBy(this.terrainFactors, (tF) => (tF.end - tF.start) * tF.value) / this.dist + 100) /
          100,
        max: _.max(terrains) || 0,
        min: _.min(terrains) || 0,
        maxDist: 0,
        minDist: 0
      }
    }

    // get distances for max/min terrain
    const terrainFactorDist = (val: number): number =>
      this.terrainFactors.reduce((a, b) => (b.value / 100 + 1 === val ? a + b.end - b.start : a), 0)
    Object.assign(stats.terrain, {
      maxDist: terrainFactorDist(stats.terrain.max),
      minDist: terrainFactorDist(stats.terrain.min)
    })

    this._stats = stats
    return stats
  }

  locationsToBreaks(locations: number[]) {
    const tmp = locations.filter((b) => b > 0 && rlt(b, this.dist, 4))
    tmp.unshift(0)

    // map to {start, end} format
    const breaks = tmp.map((b, i) => ({ start: b, end: tmp[i + 1] || this.dist }))
    return breaks
  }
}

export class CourseCutoff {
  waypoint: Waypoint

  constructor(waypoint: Waypoint) {
    this.waypoint = waypoint
  }

  get loc() {
    return this.waypoint.loc
  }
  get time(): number {
    if (!this.waypoint.cutoff) throw new Error('Invalid cutoff')
    return this.waypoint.cutoff
  }
}

class TerrainFactor {
  value: number
  startWaypoint: Waypoint
  endWaypoint: Waypoint

  constructor(startWaypoint: Waypoint, endWaypoint: Waypoint, value: number = 0) {
    this.startWaypoint = startWaypoint
    this.endWaypoint = endWaypoint
    this.value = value
  }

  get start() {
    return this.startWaypoint.loc
  }
  get end() {
    return this.endWaypoint.loc
  }
}

class TerrainType {
  type: string
  startWaypoint: Waypoint
  endWaypoint: Waypoint

  constructor(startWaypoint: Waypoint, endWaypoint: Waypoint, type: string) {
    this.startWaypoint = startWaypoint
    this.endWaypoint = endWaypoint
    this.type = type
  }

  get start() {
    return this.startWaypoint.loc
  }
  get end() {
    return this.endWaypoint.loc
  }
}
