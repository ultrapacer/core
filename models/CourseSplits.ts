import _ from 'lodash'

import { createDebug } from '../debug'
import { Factors, generateCourseFactors } from '../factors'
import { req, rlte } from '../util/math'
import { MissingDataError } from '../util/MissingDataError'
import { distScale } from '../util/units'
import { Course } from './Course'
import { CoursePoint } from './CoursePoint'
import { PlanPoint } from './PlanPoint'
import { CourseSegment } from './Segment'

const d = createDebug('CourseSplits')

export class CourseSplits {
  private _segments?: CourseSegment[]
  private _miles?: CourseSegment[]
  private _kilometers?: CourseSegment[]

  course: Course

  constructor(course: Course) {
    this.course = course
  }

  get segments() {
    if (!this._segments) this._segments = this.createSegments()
    return this._segments
  }
  set segments(v) {
    this._segments = v
  }

  get miles() {
    if (!this._miles?.length) this._miles = this.createSplits('miles')
    return this._miles
  }
  set miles(v) {
    this._miles = v
  }

  get kilometers() {
    if (!this._kilometers?.length) this._kilometers = this.createSplits('kilometers')
    return this._kilometers
  }
  set kilometers(v) {
    this._kilometers = v
  }

  createSegments() {
    d('createSegments')

    // break on non-hidden waypoints:
    const wps = this.course.waypoints.filter((x) => x.tier < 3).sort((a, b) => a.loc - b.loc)

    // determine all the stuff
    const segments = this.calcSegments(this.course.locationsToBreaks(wps.map((x) => x.loc)))

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

    const breakLocations = _.range(this.course.dist * distUnitScale).map((x) => x / distUnitScale)
    if (this.course.dist - breakLocations[breakLocations.length - 1] > 0.0001)
      breakLocations.push(this.course.dist)

    // get the stuff
    const splits = this.calcSegments(this.course.locationsToBreaks(breakLocations))

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

    const course = this.course

    const p = course.points

    if (!p?.length) {
      d2('Course points are not defined.')
      throw new MissingDataError('Course points are not defined.', 'points')
    }

    const s: CourseSegment[] = [] // segments array
    const fSums: Factors[] = [] // factor sum array
    let i
    let il
    let point1: CoursePoint = course.points[0]
    let point2
    for (i = 0, il = breaks.length; i < il; i++) {
      const b = breaks[i]

      if (point2 && req(breaks[i - 1]?.end, b.start, 4)) point1 = point2
      else point1 = course.getPoint(b.start)

      point2 = course.getPoint(b.end)
      const len = b.end - b.start
      const seg = new CourseSegment(this.course, {
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

    // move this to CourseSegment constructor
    const calcStuff = (
      seg: CourseSegment,
      p1: CoursePoint | PlanPoint,
      p2: CoursePoint | PlanPoint,
      fSum: Factors
    ) => {
      const delta = p2.alt - p1.alt
      seg[delta > 0 ? 'gain' : 'loss'] += delta * (delta > 0 ? course.gainScale : course.lossScale)
      generateCourseFactors(p1, course)
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
    }

    return s
  }
}
