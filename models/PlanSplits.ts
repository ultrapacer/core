import _ from 'lodash'

import { createDebug } from '../debug'
import { Factors, generatePlanFactors } from '../factors'
import { req, rgte, rlt, rlte } from '../util/math'
import { MissingDataError } from '../util/MissingDataError'
import { distScale } from '../util/units'
import { Plan } from './Plan'
import { PlanPoint } from './PlanPoint'
import { PlanSegment } from './Segment'

const d = createDebug('PlanSplits')

export class PlanSplits {
  private _segments?: PlanSegment[]
  private _miles?: PlanSegment[]
  private _kilometers?: PlanSegment[]

  plan: Plan

  constructor(plan: Plan) {
    this.plan = plan
  }

  get segments() {
    if (!this._segments?.length) {
      this.plan.checkPacing()
      this._segments = this.createSegments()
    }
    return this._segments
  }
  set segments(v) {
    this._segments = v
  }

  get miles() {
    if (!this._miles?.length) {
      this.plan.checkPacing()
      this._miles = this.createSplits('miles')
    }
    return this._miles
  }
  set miles(v) {
    this._miles = v
  }

  get kilometers() {
    if (!this._kilometers?.length) {
      this.plan.checkPacing()
      this._kilometers = this.createSplits('kilometers')
    }
    return this._kilometers
  }
  set kilometers(v) {
    this._kilometers = v
  }

  createSegments() {
    d('createSegments')

    // break on non-hidden waypoints:
    const wps = this.plan.course.waypoints.filter((x) => x.tier < 3).sort((a, b) => a.loc - b.loc)

    // determine all the stuff
    const segments = this.calcSegments(this.plan.course.locationsToBreaks(wps.map((x) => x.loc)))

    if (!segments.length) throw new Error('createSegments result is empty')

    // map in waypoints
    segments.forEach((x, i) => {
      x.waypoint = wps[i + 1]
    })

    return segments
  }

  createSplits(unit: string) {
    d(`createSplits:${unit}`)

    const distUnitScale = distScale(unit)

    const breakLocations = _.range(this.plan.course.dist * distUnitScale).map(
      (x) => x / distUnitScale
    )
    if (this.plan.course.dist - breakLocations[breakLocations.length - 1] > 0.0001)
      breakLocations.push(this.plan.course.dist)

    // get the stuff
    const splits = this.calcSegments(this.plan.course.locationsToBreaks(breakLocations))

    if (!splits.length) throw new Error('createSplits result is empty')

    return splits
  }

  calcSegments(breaks: { start: number; end: number }[]) {
    /*
    data {
       breaks: array of [{ start, end }, {start, end}] locations
           must be consecutive and not overlap
       course: Course object
       [plan]: Plan Object
     }
    */
    const d2 = d.extend('calcSegments')
    d2('exec')

    const plan = this.plan
    const course = plan.course

    const p = plan.points

    if (!p?.length) {
      d2('Plan points are not defined.')
      throw new MissingDataError('Plan points are not defined.', 'points')
    }

    const s: PlanSegment[] = [] // segments array
    const fSums: Factors[] = [] // factor sum array
    let i
    let il
    let point1: PlanPoint = plan.points[0]
    let point2
    for (i = 0, il = breaks.length; i < il; i++) {
      const b = breaks[i]

      if (point2 && req(breaks[i - 1]?.end, b.start, 4)) point1 = point2
      else point1 = plan.getPoint(b.start)

      point2 = plan.getPoint(b.end)
      const len = b.end - b.start
      const seg = new PlanSegment(this.plan, {
        gain: 0,
        loss: 0,
        grade:
          len > 0
            ? ((point2.alt - point1.alt) / len / 10) *
              (point2.alt - point1.alt > 0 ? course.gainScale : course.lossScale)
            : 0,
        point1,
        point2
      })
      const fSum = new Factors().init(0)

      s.push(seg)
      fSums.push(fSum)
    }

    // move this to PlanSegment constructor
    const calcStuff = (seg: PlanSegment, p1: PlanPoint, p2: PlanPoint, fSum: Factors) => {
      const delta = p2.alt - p1.alt
      seg[delta > 0 ? 'gain' : 'loss'] += delta * (delta > 0 ? course.gainScale : course.lossScale)
      generatePlanFactors(p1, plan)
      const len = p2.loc - p1.loc
      fSum.applyEach((v, b) => v + b * len, p1.factors)
    }

    i = 1
    for (let k = 0; k < s.length; k++) {
      const seg = s[k] // current segment
      const fSum = fSums[k]

      // skip along until we're past point1
      while (rlte(p[i].loc, seg.point1.loc, 4)) i++

      let p1 = seg.point1

      while (i < p.length && rlte(p[i].loc, seg.point2.loc, 4)) {
        const p2 = p[i]

        // from p1 to p2
        calcStuff(seg, p1, p2, fSum)

        p1 = p2
        i++
      }

      // last bit to seg.point2
      calcStuff(seg, p1, seg.point2, fSum)

      // add in delays:
      if (plan) {
        seg.delay = plan.delays
          .filter((d) => rgte(seg.point1.loc, d.loc, 4) && rlt(seg.point2.loc, d.loc, 4))
          .reduce((p, a) => p + a.delay, 0)
      }
    }

    return s
  }
}
