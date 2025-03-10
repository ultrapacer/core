import _ from 'lodash'

import { defaultModel as defaultGradeModel } from '~/factors/grade/defaults'

import { createDebug } from '../debug'
import { factorKeys, generatePlanFactors } from '../factors'
import { Strategy } from '../factors/strategy'
import { Types } from '../main'
import { interp, interpArray, req, rgte } from '../util/math'
import { Event } from './Event'
import { Pacing } from './Pacing'
import { PlanPoint } from './PlanPoint'
import { PlanSplits } from './PlanSplits'

const d = createDebug('models:Plan')

function validateScales(scales?: Types.PlanScales) {
  if (
    !scales ||
    Object.keys(scales).every((k) => {
      const v = scales[k as keyof Types.PlanScales]
      return v === undefined || (v >= 0 && v <= 2)
    })
  )
    return

  throw new Error('Plan scales must be between 0 and 2')
}

export class Plan implements Types.Plan {
  private _cache: {
    cutoffs?: PlanCutoff[]
    delays?: Types.Plan['delays']
    event?: Types.Event
    events?: Types.Plan['events']
    gradeModel?: Types.PlanGradeModel
    heatModel?: Types.PlanHeatModel
    stats?: Types.Plan['stats']
    strategy?: Types.Strategy
    version?: number
  } = {}
  get cache() {
    if (this._cache?.version === this.version) return this._cache
    this._cache = { version: this.version }
    return this._cache
  }

  private _data: Types.PlanData

  readonly course: Types.Course

  get cutoffMargin() {
    return this._data.cutoffMargin
  }

  get cutoffs(): PlanCutoff[] {
    if ('cutoffs' in this.cache) return this.cache.cutoffs

    this.cache.cutoffs = this.cutoffMargin
      ? this.course.cutoffs?.map((c) => new PlanCutoff(this, c, this.getPoint(c.loc, true))) || []
      : []

    // if any cutoffs are extraneous, delete them
    let i = 0
    while (this.cache.cutoffs.length - 1 >= i) {
      const cutoff = this.cache.cutoffs[i]
      if (
        this.cache.cutoffs.find((c: { time: number }, j: number) => j > i && c.time <= cutoff.time)
      ) {
        d(`get cutoffs: deleting extraneous cutoff at ${cutoff.loc} km`)
        this.cache.cutoffs.splice(i, 1)
      } else i++
    }

    return this.cache.cutoffs
  }

  get delay() {
    return _.sumBy(this.delays, 'delay')
  }

  get delays(): PlanDelay[] {
    if ('delays' in this.cache) return this.cache.delays

    const delays = this.course.waypoints
      .map((waypoint) => {
        const wpd = this._data.delays?.find(
          (d) => d.loop === waypoint.loop && d.siteId === waypoint.site.id
        )
        const delay = wpd ? wpd.delay : waypoint.hasTypicalDelay ? this.typicalDelay : 0
        return new PlanDelay(waypoint, delay)
      })
      .filter((d: { delay: number }) => d.delay > 0)
      .sort((a: { loc: number }, b: { loc: number }) => a.loc - b.loc)

    // if any delays are in duplicate locations, combine them
    let i = 0
    while (delays.length - 1 >= i) {
      if (i > 0 && delays[i].loc === delays[i - 1].loc) {
        d(`get delays: merging delay at ${delays[i].loc} km`)
        delays[i - 1].delay += delays[i].delay
        delays.splice(i, 1)
      } else i++
    }

    this.cache.delays = delays

    return this.cache.delays
  }

  get event(): Types.Event {
    if ('event' in this.cache) return this.cache.event

    if (this._data.start)
      return (this.cache.event = new Event(
        this._data.start.date,
        this._data.start.timezone,
        this.points[0].lat,
        this.points[0].lon
      ))
    throw new Error('Start date/timezone is required for either the plan or the course')
  }

  get events() {
    if ('events' in this.cache) return this.cache.events

    // create array of sun events during the course:
    d('calculating events.sun')
    const eventTimes: { event: Types.SunEventType; elapsed: number }[] = []
    const startTimeOfDay = this.event.elapsedToTimeOfDay(0)
    const days = Math.ceil((startTimeOfDay + this.points[this.points.length - 1].elapsed) / 86400)
    for (let d = 0; d < days; d++) {
      const arr: { event: Types.SunEventType; time: number }[] = [
        { event: 'dawn', time: this.event.sun.dawn },
        { event: 'sunrise', time: this.event.sun.sunrise },
        { event: 'nadir', time: this.event.sun.nadir },
        { event: 'sunset', time: this.event.sun.sunset },
        { event: 'dusk', time: this.event.sun.dusk }
      ]
      arr.forEach((e) => {
        // get elapsed time of the event:
        const elapsed = e.time - startTimeOfDay + 86400 * d

        // if it happens in the data, add it to the array
        if (elapsed >= 0 && elapsed <= this.points[this.points.length - 1].elapsed) {
          eventTimes.push({ event: e.event, elapsed })
        }
      })
    }
    // sort by elapsed time:
    eventTimes.sort((a, b) => a.elapsed - b.elapsed)

    // interpolate distances from elapsed times:
    const locs = interpArray(
      this.points.map((p) => p.elapsed),
      this.points.map((p) => p.loc),
      eventTimes.map((x) => x.elapsed)
    )
    const sun = eventTimes.map((s, i) => ({ ...s, loc: locs[i] }))

    this.cache.events = { sun }

    return this.cache.events
  }

  get gradeModel(): Types.PlanGradeModel {
    if ('gradeModel' in this.cache) return this.cache.gradeModel
    if (typeof this._data.scales?.descending1 === 'number') {
      const model = defaultGradeModel
      // TODO come up with other model here
      this.cache.gradeModel = model
    } else this.cache.gradeModel = defaultGradeModel
    return this.cache.gradeModel
  }

  get heatModel(): { start: number; stop: number; baseline: number; max: number } | undefined {
    if ('heatModel' in this.cache) return this.cache.heatModel

    if (this._data.heatModel)
      return (this.cache.heatModel = {
        start: this.event.sun.sunrise + 1800,
        stop: this.event.sun.sunset + 7200,
        baseline: this._data.heatModel.baseline,
        max: this._data.heatModel.max
      })
    return (this.cache.heatModel = undefined)
  }

  get id() {
    return this._data.id
  }

  get method() {
    return this._data.method
  }

  get name() {
    return this._data.name
  }

  pacing: Types.Pacing = new Pacing(this)

  readonly points: Types.PlanPoint[]

  get scales() {
    return this._data.scales
  }

  readonly splits: Types.PlanSplits = new PlanSplits(this)

  get stats() {
    if ('stats' in this.cache) return this.cache.stats

    // add in statistics
    // these are max and min values for each factor
    d('calculating stats.factors')
    const factors = _.fromPairs(
      factorKeys.map((k) => {
        const values = this.points.map((p) => p.factors[k])
        return [
          k,
          {
            min: Number(_.min(values)),
            max: Number(_.max(values))
          }
        ]
      })
    )

    // time in sun zones:
    d('calculating stats.sun')
    const sun = {
      day: { time: 0, dist: 0 },
      twilight: { time: 0, dist: 0 },
      dark: { time: 0, dist: 0 }
    }
    let dloc = 0
    let dtime = 0
    this.points.forEach((x: { loc: number; elapsed: number; tod: number }, i: number) => {
      dloc = x.loc - (this.points[i - 1]?.loc || 0)
      dtime = x.elapsed - (this.points[i - 1]?.elapsed || 0)
      if (
        !isNaN(this.event.sun.dawn) &&
        !isNaN(this.event.sun.dusk) &&
        (x.tod <= this.event.sun.dawn || x.tod >= this.event.sun.dusk)
      ) {
        sun.dark.time += dtime
        sun.dark.dist += dloc
      } else if (x.tod < this.event.sun.sunrise || x.tod > this.event.sun.sunset) {
        sun.twilight.time += dtime
        sun.twilight.dist += dloc
      } else {
        sun.day.time += dtime
        sun.day.dist += dloc
      }
    })

    this.cache.stats = { factors, sun }

    return this.cache.stats
  }

  get strategy(): Types.Strategy {
    if ('strategy' in this.cache) return this.cache.strategy
    return (this.cache.strategy = new Strategy(this, this._data.strategy))
  }

  get target() {
    return this._data.target
  }

  get typicalDelay(): number {
    return this._data.typicalDelay ?? 180
  }

  /**
   * Version of plan update (non trivial changes that affect pacing)
   */
  _version: number = 0

  /**
   * Version of course & plan update (non trivial changes that affect pacing)
   */
  get version() {
    return this._version + this.course.version
  }

  constructor(course: Types.Course, data: Types.PlanData) {
    validateScales(data.scales)

    this.course = course
    this._data = data

    // if data.delays exists, make sure ids are valid site ids:
    if (data.delays) {
      const validIds = course.sites.map((site) => site.id)
      const bad = data.delays.find((d) => !validIds.includes(d.siteId))
      if (bad) {
        console.error(`Site in plan delays is not in course sites (${String(bad.siteId)})`)
        throw new Error('Site in plan delays is not in course sites.')
      }
    }

    this.points = this.course.points.map((point) => new PlanPoint(this, point))

    this._version = 1
  }

  checkPacing() {
    d('checkPacing')
    if (!this.pacing.status?.complete || !this.pacing.isCurrent) {
      d('checkPacing: calculate')
      this.pacing.calculate()
    }

    // this is mostly just to trigger the points getter
    if (!this.points?.length) throw new Error('No plan points')
    return true
  }

  getDelayAtWaypoint(waypoint: Types.Waypoint): number {
    return this.delays.find((d) => d.waypoint === waypoint)?.delay || 0
  }

  getPoint(loc: number, insert: boolean = false): Types.PlanPoint {
    // get and return it if already exists
    const i2 = this.points.findIndex((p) => rgte(p.loc, loc, 4))
    const p2 = this.points[i2]

    // if point exists, return it
    if (req(p2.loc, loc, 4)) return p2

    d(`getPoint: ${insert ? 'inserting' : 'creating'} new PlanPoint at ${loc}`)

    // define first point for interpolation
    const i1 = i2 - 1
    const p1 = this.points[i1]

    // create a new point
    const point = new PlanPoint(this, this.course.getPoint(loc))

    // delay at this point is the increase in elapsed time from the previous point
    point.delay = Math.round(p2.elapsed - p1.elapsed - (p2.time - p1.time))

    // time is linearly interpolated between points
    point.time = interp(p1.loc, p2.loc, p1.time, p2.time, point.loc)

    // elapsed time by adding delay and delta time to previous point
    point.elapsed = p1.elapsed + p1.delay + (point.time - p1.time)

    // time of day is calculated from elapsed time
    point.tod = this.event.elapsedToTimeOfDay(point.elapsed)

    // update factors
    generatePlanFactors(point, this)

    if (insert) this.points.splice(i2, 0, point)

    return point
  }

  update(data: Types.PlanUpdateData) {
    validateScales(data.scales)

    // check for invalid null or undefined values
    const keys = ['target', 'method'] as (keyof Types.PlanUpdateData)[]
    const k = keys.find((k) => k in data && _.isNil(data[k]))
    if (k) throw new Error(`Plan.${k} cannot be set to null or undefined`)

    Object.assign(this._data, data)
    this._version++
  }
}

class PlanDelay implements Types.PlanDelay {
  delay: number
  waypoint: Types.Waypoint

  constructor(waypoint: Types.Waypoint, delay: number) {
    this.waypoint = waypoint
    this.delay = delay
  }

  get loc() {
    return this.waypoint.loc
  }
}

class PlanCutoff implements Types.PlanCutoff {
  plan: Types.Plan
  courseCutoff: Types.CourseCutoff
  point: Types.PlanPoint

  constructor(plan: Types.Plan, courseCutoff: Types.CourseCutoff, point: Types.PlanPoint) {
    this.plan = plan
    this.courseCutoff = courseCutoff
    this.point = point
  }

  get waypoint() {
    return this.courseCutoff.waypoint
  }
  get loc() {
    return this.courseCutoff.loc
  }
  get time() {
    return (
      this.courseCutoff.time -
      Math.max(this.plan.cutoffMargin || 0, this.plan.getDelayAtWaypoint(this.waypoint))
    )
  }
}
