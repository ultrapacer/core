import _ from 'lodash'

import { Factors, generate, list } from './factors/index.js'
import { Segment } from './models/Segment.js'
import { createDebug, MissingDataError } from './util/index.js'
import { req, rgte, rlt, rlte } from './util/math.js'

const d = createDebug('geo')

const fKeys = list
// creates an object with keys from fKeys above with initial values of init
function fObj(init) {
  const obj = {}
  fKeys.forEach((k) => {
    const a = {}
    a[k] = init
    Object.assign(obj, a)
  })
  return obj
}

export function calcSegments({ plan, course, breaks }) {
  /*
  data {
     breaks: array of [loc,loc,...] to break on (start at 0)
              or:
             array of [{ start, end }, {start, end}] locations
         must be consecutive and not overlap
     course: Course object
     [plan]: Plan Object
   }
  */
  const d2 = d.extend('calcSegments')
  d2('exec')

  // if breaks is array of loctions, convert to array of {start, end}:
  if (_.isNumber(breaks[0])) {
    // make sure we start at 0 and dont include end point
    breaks = breaks.filter((b) => b > 0 && rlt(b, course.dist, 4))
    breaks.unshift(0)

    // map to {start, end} format
    breaks = breaks.map((b, i) => ({ start: b, end: breaks[i + 1] || course.dist }))
  }

  const p = plan ? plan.points : course.points

  if (!p?.length) {
    d2(`${plan ? 'Plan' : 'Course'} points are not defined.`)
    throw new MissingDataError((plan ? 'Plan' : 'Course') + ' points are not defined.', 'points')
  }

  const s = [] // segments array
  let i
  let il
  let point1
  let point2
  const hasActuals = p[0].actual !== undefined && p[p.length - 1].actual !== undefined
  for (i = 0, il = breaks.length; i < il; i++) {
    const b = breaks[i]

    if (req(breaks[i - 1]?.end, b.start, 4)) point1 = point2
    else point1 = plan ? plan.getPoint({ loc: b.start }) : course.getPoint({ loc: b.start })

    point2 = plan ? plan.getPoint({ loc: b.end }) : course.getPoint({ loc: b.end })
    const len = b.end - b.start
    const seg = new Segment({
      end: point2.loc,
      len,
      gain: 0,
      loss: 0,
      alt: point2.alt, // ending altitude
      grade:
        len > 0
          ? ((point2.alt - point1.alt) / len / 10) *
            (point2.alt - point1.alt > 0 ? course.gainScale : course.lossScale)
          : 0,
      delay: 0,
      factorsSum: fObj(0),
      point1,
      point2
    })

    // add actual times:
    if (hasActuals) {
      seg.actualTime = seg.point2.actual.elapsed - seg.point1.actual.elapsed
      seg.actualElapsed = seg.point2.actual.elapsed
    }

    s.push(seg)
  }

  const calcStuff = ({ seg, p1, p2 }) => {
    const delta = p2.alt - p1.alt
    seg[delta > 0 ? 'gain' : 'loss'] += delta * (delta > 0 ? course.gainScale : course.lossScale)
    generate(p1, { plan, course })
    const len = p2.loc - p1.loc
    fKeys.forEach((key) => {
      seg.factorsSum[key] += p1.factors[key] * len
    })
  }

  i = 1
  let seg, p1, p2
  for (let k = 0; k < s.length; k++) {
    seg = s[k] // current segment

    // skip along until we're past point1
    while (rlte(p[i].loc, seg.point1.loc, 4)) i++

    p1 = seg.point1

    while (i < p.length && rlte(p[i].loc, seg.point2.loc, 4)) {
      p2 = p[i]

      // from p1 to p2
      calcStuff({ p1, p2, seg })

      p1 = p2
      i++
    }

    // last bit to seg.point2
    calcStuff({ p1, p2: seg.point2, seg })

    // add in delays:
    if (plan) {
      seg.delay = plan.delays
        .filter((d) => rgte(seg.point1.loc, d.loc, 4) && rlt(seg.point2.loc, d.loc, 4))
        .reduce((p, a) => p + a, 0)
    }
  }

  // normalize each factor by length
  s.forEach((x) => {
    x.factors = new Factors(
      Object.fromEntries(fKeys.map((key) => [key, x.factorsSum[key] / x.len]))
    )
  })

  return s
}

export function createSegments(data) {
  // data: {[plan], [course]}

  d('createSegments')

  if (data.plan && !data.course) data.course = data.plan.course

  // break on non-hidden waypoints:
  const wps = data.course.waypoints.filter((x) => x.tier < 3).sort((a, b) => a.loc - b.loc)

  // get array of location breaks:
  data.breaks = wps.map((x) => {
    return x.loc
  })

  // determine all the stuff
  const segments = calcSegments(data)

  if (!segments.length) throw new Error('createSegments result is empty')

  // map in waypoints
  segments.forEach((x, i) => {
    x.waypoint = wps[i + 1]
  })

  return segments
}

export function createSplits(data) {
  // data: {unit, [plan], [course]}

  d(`createSplits:${data.unit}`)

  if (data.plan && !data.course) data.course = data.plan.course

  const distUnitScale = data.unit === 'kilometers' ? 1 : 0.621371

  const breaks = _.range(data.course.dist * distUnitScale).map((x) => x / distUnitScale)
  if (data.course.dist - _.last(breaks) > 0.0001) breaks.push(data.course.dist)

  Object.assign(data, { breaks })

  // get the stuff
  const splits = calcSegments(data)

  if (!splits.length) throw new Error('createSplits result is empty')

  return splits
}
