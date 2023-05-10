const _ = require('lodash')
const factors = require('./factors')
const { rlt, rgt, rlte, rgte, req, interpArray } = require('./util/math')
const Segment = require('./models/Segment')
const Pacing = require('./models/Pacing')
const MissingDataError = require('./util/MissingDataError')
const fKeys = factors.list

// creates an object with keys from fKeys above with initial values of init
function fObj (init) {
  const obj = {}
  fKeys.forEach(k => { const a = {}; a[k] = init; Object.assign(obj, a) })
  return obj
}

function calcSegments ({ plan, course, breaks }) {
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

  // if breaks is array of loctions, convert to array of {start, end}:
  if (_.isNumber(breaks[0])) {
    // make sure we start at 0 and dont include end point
    breaks = breaks.filter(b => b > 0 && rlt(b, course.dist, 4))
    breaks.unshift(0)

    // map to {start, end} format
    breaks = breaks.map((b, i) => ({ start: b, end: breaks[i + 1] || course.dist }))
  }

  const p = plan ? plan.points : course.points

  if (!p?.length) throw new MissingDataError((plan ? 'Plan' : 'Course') + ' points are not defined.')

  const s = [] // segments array
  let i
  let il
  let point1
  let point2
  const hasActuals = (p[0].actual !== undefined && p[p.length - 1].actual !== undefined)
  for (i = 0, il = breaks.length; i < il; i++) {
    const b = breaks[i]

    if (req(breaks[i - 1]?.end, b.start, 4)) point1 = point2
    else point1 = plan ? plan.getPoint({ loc: b.start }) : course.getPoint({ loc: b.start })

    point2 = plan ? plan.getPoint({ loc: b.end }) : course.getPoint({ loc: b.end })
    const len = b.end - b.start
    const seg = new Segment({
      start: point1.loc,
      end: point2.loc,
      len,
      gain: 0,
      loss: 0,
      alt: point2.alt, // ending altitude
      grade: len > 0 ? (point2.alt - point1.alt) / len / 10 * (point2.alt - point1.alt > 0 ? course.gainScale : course.lossScale) : null,
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
    factors.generate(p1, { plan, course })
    const len = p2.loc - p1.loc
    fKeys.forEach(key => {
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
        .filter(d => rgte(seg.point1.loc, d.loc, 4) && rlt(seg.point2.loc, d.loc, 4))
        .reduce((p, a) => p + a, 0)
    }
  }

  // normalize each factor by length
  s.forEach((x, i) => {
    x.factors = new factors.Factors(
      Object.fromEntries(fKeys.map(key => [key, x.factorsSum[key] / x.len]))
    )
  })

  return s
}

// TODO: loosen up calcs; dont display seconds for elapsed in tables
function calcPacing (data) {
  /*
    data:
      plan,
      options: {
        iterationThreshold (seconds),
        testLocations [(km)]
      }
  */

  const minIterations = 3
  let maxIterations = 20
  if (data.plan.adjustForCutoffs) maxIterations += 3 * (data.plan.cutoffs.length || 0) // iterations

  // assign options from input:
  const options = {
    iterationThreshold: 15,
    testLocations: Array.apply(null, Array(10)).map((x, i) => (i + 1) / 10 * data.plan.course.dist)
  }
  if (data.options) Object.assign(options, data.options)

  // make sure test locations are at least every 1/10th of the course:
  let itl = 0
  while (itl < options.testLocations.length - 1) {
    if (options.testLocations[itl + 1] - options.testLocations[itl] > data.plan.course.dist / 10) {
      options.testLocations.splice(
        itl + 1,
        0,
        Math.min(
          options.testLocations[itl] + data.plan.course.dist / 10,
          (options.testLocations[itl] + options.testLocations[itl + 1]) / 2
        )
      )
    }
    itl += 1
  }

  data.plan.initializePoints()

  data.plan.course.terrainFactors?.forEach(tf => data.plan.getPoint({ loc: tf.start, insert: true }))
  if (data.plan.adjustForCutoffs) {
    data.plan.cutoffs.forEach(c => {
      c.point = data.plan.getPoint({ loc: c.loc, insert: true })
    })
  }

  // replace plan.pacing object with new clean object
  data.plan.pacing = new Pacing({ _plan: data.plan })

  if (!data.plan.pacing.status) data.plan.pacing.status = {}

  const { factor, factors } = data.plan.applyPacing()
  Object.assign(data.plan.pacing, { factor, factors })

  // points for sensitivity test:
  const testPoints = options.testLocations.map(tl => data.plan.getPoint({ loc: tl, insert: true }))

  let lastTest = []

  let i
  const tests = {}
  let pass = false
  for (i = 0; i < maxIterations; i++) {
    const { factor, factors } = data.plan.applyPacing({ addBreaks: false })
    Object.assign(data.plan.pacing, { factor, factors })

    tests.minIterations = i >= minIterations

    // cutoffsPassing test makes sure intermediate cutoffs are met (not final cutoff)
    tests.cutoffs =
      !data.plan.adjustForCutoffs ||
      adjustForCutoffs(data, i)

    // testPassing test makes sure interim tests are within the specified iterationThreshold
    const newTest = testPoints.map(x => { return x.elapsed })
    tests.locations =
      lastTest.length &&
      newTest.findIndex((x, j) => Math.abs(x - lastTest[j]) >= options.iterationThreshold) < 0

    // tests.target makes sure the final point is within a half second of target time (or cutoff max)
    const elapsed = _.last(data.plan.points).elapsed
    tests.target =
      data.plan.pacingMethod === 'time'
        ? Math.abs(data.plan.pacing.elapsed - elapsed) < 0.5
        : true

    pass = (
      tests.minIterations &&
      tests.cutoffs &&
      tests.locations &&
      tests.target
    )

    if (pass) break

    lastTest = [...newTest]
  }

  data.plan.pacing.status.tests = tests
  data.plan.pacing.status.success = pass
  data.plan.pacing.status.iterations = i

  // add in statistics
  // these are max and min values for each factor
  const fstats = { max: fObj(0), min: fObj(100) }
  data.plan.points.filter((p, j) => j < data.plan.points.length - 1).forEach((p, j) => {
    fKeys.forEach(k => {
      fstats.max[k] = Math.max(fstats.max[k], data.plan.points[j].factors[k])
      fstats.min[k] = Math.min(fstats.min[k], data.plan.points[j].factors[k])
    })
  })
  data.plan.pacing.fstats = fstats

  if (data.plan.event?.sun) {
    const s = calcSunTime({
      points: data.plan.points,
      event: data.plan.event
    })
    Object.assign(data.plan.pacing, s)

    // create array of sun events during the course:
    data.plan.pacing.sunEvents = []
    const eventTypes = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'noon']
    const days = Math.ceil((data.plan.event.startTime + _.last(data.plan.points).elapsed) / 86400)
    for (let d = 0; d < days; d++) {
      eventTypes.forEach(event => {
        // get elapsed time of the event:
        const elapsed = data.plan.event.sun[event] - data.plan.event.startTime + (86400 * d)

        // if it happens in the data, add it to the array
        if (elapsed >= 0 && elapsed <= _.last(data.plan.points).elapsed) {
          data.plan.pacing.sunEvents.push({ event, elapsed })
        }
      })
    }

    // sort by elapsed time
    data.plan.pacing.sunEvents.sort((a, b) => a.elapsed - b.elapsed)

    // interpolate distances from elapsed times:
    if (data.plan.pacing.sunEvents.length) {
      const locs = interpArray(
        data.plan.points.map(x => { return x.elapsed }),
        data.plan.points.map(x => { return x.loc }),
        data.plan.pacing.sunEvents.map(x => { return x.elapsed })
      )
      locs.forEach((l, i) => { data.plan.pacing.sunEvents[i].loc = l })
    }
  }

  return data.plan.pacing
}

function adjustForCutoffs (data, i) {
  // data is same as data objct in calcPacing
  // i is the iteration number

  // filter out any existing stragegy elements with negative values
  const cutoffs = data.plan.cutoffs.filter(c => rlt(c.loc, data.plan.course.dist, 4))

  const strats = cutoffs.map((c, i) => {
    const prev = data.plan.pacing.strategy.autos
      .filter(s => rlt(s.onset, c.loc, 4))
      .pop() ||
        {
          onset: 0,
          point: data.plan.points[0]
        }

    const next = data.plan.pacing.strategy.autos
      .find(s => rgt(s.onset, c.loc, 4)) ||
        {
          onset: data.plan.course.dist,
          point: _.last(data.plan.points)
        }

    // make sure we have points mapped
    if (!prev.point) prev.point = data.plan.getPoint({ loc: prev.onset, insert: true })
    if (!next.point) next.point = data.plan.getPoint({ loc: next.onset, insert: true })

    const delay =
      data.plan.delays
        .filter(d =>
          rgte(d.loc, prev.point.loc, 4) &&
          rlt(d.loc, c.loc, 4)
        ).reduce((v, x) => { return v + x.delay }, 0)

    const time = c.point.time - prev.point.time // moving time (no delays)
    const cutoffTime = c.time - prev.point.elapsed - delay // ideal time, no delay

    const overTime = time - cutoffTime

    const a = c.loc - prev.point.loc

    const b = next.point.loc - c.loc

    const scale = overTime / cutoffTime
    const step = (a * scale / b) + scale

    return { onset: c.loc, type: 'step', value: step * 100, point: c.point }
  })

  const steps = strats
    .filter(ss =>
      ss.value > 0 &&
      !data.plan.pacing.strategy.autos.find(s3 => req(s3.onset, ss.onset, 4))
    ).map(s => s.value)
  const max = Math.max(...steps)
  const strat = strats.find(ss => ss.value === max)

  let added = false

  // every fourth iteration, if there is a strategy to add, do so
  if (i === 4 * (data.plan.pacing.strategy.autos.length + 1) && strat) {
    added = true
    data.plan.pacing.strategy.addAuto(strat)
  }

  // refine existing strategies on iterations where a new one isnt added
  if (!added) {
    data.plan.pacing.strategy?.autos?.forEach((s, j) => {
      const strat = strats.find(ss => req(ss.onset, s.onset, 4))
      data.plan.pacing.strategy.adjustAutoValue(s, strat.value)
    })
  }

  return Boolean(
    !added &&
    cutoffs.filter(c => c.point.elapsed - c.time >= 0.5).length === 0
  )
}

function calcSunTime (data) {
  // data = {points, event}

  // time in sun zones:
  const s = {
    sunTime: { day: 0, twilight: 0, dark: 0 },
    sunDist: { day: 0, twilight: 0, dark: 0 }
  }
  let dloc = 0
  let dtime = 0
  data.points.forEach((x, i) => {
    dloc = x.loc - (data.points[i - 1]?.loc || 0)
    dtime = x.elapsed - (data.points[i - 1]?.elapsed || 0)
    if (
      !isNaN(data.event.sun.dawn) &&
      !isNaN(data.event.sun.dusk) &&
      (
        x.tod <= data.event.sun.dawn ||
        x.tod >= data.event.sun.dusk
      )
    ) {
      s.sunTime.dark += dtime
      s.sunDist.dark += dloc
    } else if (
      x.tod < data.event.sun.sunrise ||
      x.tod > data.event.sun.sunset
    ) {
      s.sunTime.twilight += dtime
      s.sunDist.twilight += dloc
    } else {
      s.sunTime.day += dtime
      s.sunDist.day += dloc
    }
  })
  return s
}

function createSegments (data) {
  // data: {[plan], [course]}
  if (data.plan && !data.course) data.course = data.plan.course

  // break on non-hidden waypoints:
  const wps = data.course.waypoints.filter(x => x.tier < 3).sort((a, b) => a.loc - b.loc)

  // get array of location breaks:
  data.breaks = wps.map(x => { return x.loc })

  // determine all the stuff
  const segments = calcSegments(data)

  // map in waypoints
  segments.forEach((x, i) => {
    x.waypoint = wps[i + 1]
  })

  return segments
}

function createSplits (data) {
  // data: {unit, [plan], [course]}
  if (data.plan && !data.course) data.course = data.plan.course

  const distUnitScale = (data.unit === 'kilometers') ? 1 : 0.621371
  const tot = data.course.dist * distUnitScale

  const breaks = [0]
  let i = 1
  while (i < tot) {
    breaks.push(i / distUnitScale)
    i++
  }
  if (tot / distUnitScale > breaks[breaks.length - 1]) {
    breaks.push(tot / distUnitScale)
  }

  // remove last break if it's negligible
  if (
    breaks.length > 1 &&
    breaks[breaks.length - 1] - breaks[breaks.length - 2] < 0.0001
  ) {
    breaks.pop()
  }
  Object.assign(data, { breaks })

  // get the stuff
  const splits = calcSegments(data)

  return splits
}

exports.calcSegments = calcSegments
exports.calcPacing = calcPacing
exports.createSegments = createSegments
exports.createSplits = createSplits
