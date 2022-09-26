const factors = require('./factors')
const { rlt, rgt, rgte, req, interpArray } = require('./util/math')
const Meter = require('./util/Meter')
const Segment = require('./models/Segment')
const { interpolatePoint } = require('./models/points')
const _ = require('lodash')
const fKeys = factors.list

// creates an object with keys from fKeys above with initial values of init
function fObj (init) {
  const obj = {}
  fKeys.forEach(k => { const a = {}; a[k] = init; Object.assign(obj, a) })
  return obj
}

async function calcSegments (data) {
  /*
  data {
     breaks: array of [loc,loc,...] to break on (start at 0)
     course: Course object
     [plan]: Plan Object
   }
  */
  const meter = new Meter()
  const p = data.plan ? data.plan.points : data.course.points
  const breaks = data.breaks

  const s = [] // segments array
  const alts = data.course.track.getLLA(breaks).map(lla => { return lla.alt })
  let len = 0
  let i
  let il
  const hasActuals = (p[0].actual !== undefined && p[p.length - 1].actual !== undefined)
  for (i = 1, il = breaks.length; i < il; i++) {
    len = breaks[i] - breaks[i - 1]
    s.push(new Segment({
      end: breaks[i],
      len,
      gain: 0,
      loss: 0,
      alt: alts[i], // ending altitude
      grade: len > 0 ? (alts[i] - alts[i - 1]) / len / 10 : null,
      delay: 0,
      factorsSum: fObj(0),
      point1: data.plan ? data.plan.getOrInsertPoint(breaks[i - 1]) : data.course.getOrInsertPoint(breaks[i - 1]),
      point2: data.plan ? data.plan.getOrInsertPoint(breaks[i]) : data.course.getOrInsertPoint(breaks[i])
    }))
    await meter.go()
  }

  const delays = data.plan ? [...data.plan.delays] : []
  function getDelay (a, b) {
    if (!delays.length) { return 0 }
    while (delays.length && delays[0].loc < a) {
      delays.shift()
    }
    if (delays.length && delays[0].loc < b) {
      const d = delays.shift()
      return d.delay
    }
    return 0
  }

  i = 1
  for (let k = 0; k < s.length; k++) {
    const s1 = s[k] // current segment
    while (i < p.length && p[i - 1].loc <= s1.end) {
      const p1 = p[i - 1]
      const p2 = p[i]
      let arr = []

      // if segment ends between p1 & p2, calc two chunks:
      if (p2.loc > s1.end && k < s.length - 1) {
        const p3 = interpolatePoint(p1, p2, s1.end)
        arr = [
          { s: s1, p: [p1, p3] },
          { s: s[k + 1], p: [p3, p2] }
        ]
      } else {
        arr = [{ s: s1, p: [p1, p2] }]
      }
      arr.forEach(a => {
        const delta = a.p[1].alt - a.p[0].alt
        a.s[delta > 0 ? 'gain' : 'loss'] += delta
        factors.generate(a.p[0], { plan: data.plan, course: data.course })
        const len = a.p[1].loc - a.p[0].loc
        let f = 1
        fKeys.forEach(key => {
          a.s.factorsSum[key] += a.p[0].factors[key] * len
          f = f * a.p[0].factors[key]
        })

        if (data.plan) {
          a.s.delay += getDelay(a.p[0].loc, a.s.end)
        }
      })
      i++
    }
    await meter.go()
  }

  // normalize each factor by length and sum elapsed time
  s.forEach((x, i) => {
    x.factors = new factors.Factors(
      Object.fromEntries(fKeys.map(key => [key, x.factorsSum[key] / x.len]))
    )
  })

  if (hasActuals) {
    s.forEach((seg, i) => {
      const p1 = p.find(point => point.loc >= seg.end - seg.len)
      let p2 = {}
      if (i === s.length - 1) {
        p2 = p[p.length - 1]
      } else {
        p2 = p.find(point => point.loc >= seg.end)
      }
      seg.actualTime = p2.actual.elapsed - p1.actual.elapsed
      seg.actualElapsed = p2.actual.elapsed
    })
  }

  return s
}

// TODO: loosen up calcs; dont display seconds for elapsed in tables
async function calcPacing (data) {
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

  await data.plan.initializePoints()

  data.plan.course.terrainFactors?.forEach(tf => data.plan.getOrInsertPoint(tf.start))
  if (data.plan.adjustForCutoffs) {
    data.plan.cutoffs.forEach(c => {
      c.point = data.plan.getOrInsertPoint(c.loc)
    })
  }

  data.pacing = data.plan.pacing
  if (!data.pacing.status) data.pacing.status = {}

  const { factor, factors } = await data.plan.applyPacing()
  Object.assign(data.plan.pacing, { factor, factors })

  // points for sensitivity test:
  const testPoints = options.testLocations.map(tl => data.plan.getOrInsertPoint(tl))

  let lastTest = []

  let i
  const tests = {}
  for (i = 0; i < maxIterations; i++) {
    const { factor, factors } = await data.plan.applyPacing({ addBreaks: false })
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

    if (
      tests.minIterations &&
      tests.cutoffs &&
      tests.locations &&
      tests.target
    ) {
      break
    }
    lastTest = [...newTest]
  }

  // add in statistics
  // these are max and min values for each factor
  const fstats = { max: fObj(0), min: fObj(100) }
  data.plan.points.filter((p, j) => j < data.plan.points.length - 1).forEach((p, j) => {
    fKeys.forEach(k => {
      fstats.max[k] = Math.max(fstats.max[k], data.plan.points[j].factors[k])
      fstats.min[k] = Math.min(fstats.min[k], data.plan.points[j].factors[k])
    })
  })
  data.pacing.fstats = fstats

  data.pacing.status.tests = tests
  data.pacing.status.success = i < maxIterations
  data.pacing.status.iterations = i

  if (data.plan.event?.sun) {
    const s = calcSunTime({
      points: data.plan.points,
      event: data.plan.event
    })
    Object.assign(data.pacing, s)

    // create array of sun events during the course:
    data.pacing.sunEvents = []
    const eventTypes = ['nadir', 'dawn', 'sunrise', 'dusk', 'sunset', 'noon']
    const days = Math.ceil((data.plan.event.startTime + _.last(data.plan.points).elapsed) / 86400)
    for (let d = 0; d < days; d++) {
      eventTypes.forEach(event => {
        // get elapsed time of the event:
        const elapsed = data.plan.event.sun[event] - data.plan.event.startTime + (86400 * d)

        // if it happens in the data, add it to the array
        if (elapsed >= 0 && elapsed <= _.last(data.plan.points).elapsed) {
          data.pacing.sunEvents.push({ event, elapsed })
        }
      })
    }

    // sort by elapsed time
    data.pacing.sunEvents.sort((a, b) => a.elapsed - b.elapsed)

    // interpolate distances from elapsed times:
    if (data.pacing.sunEvents.length) {
      const locs = interpArray(
        data.plan.points.map(x => { return x.elapsed }),
        data.plan.points.map(x => { return x.loc }),
        data.pacing.sunEvents.map(x => { return x.elapsed })
      )
      locs.forEach((l, i) => { data.pacing.sunEvents[i].loc = l })
    }
  }

  return data.pacing
}

function adjustForCutoffs (data, i) {
  // data is same as data objct in calcPacing
  // i is the iteration number

  // filter out any existing stragegy elements with negative values
  const cutoffs = data.plan.cutoffs.filter(c => rlt(c.loc, data.plan.course.dist, 4))

  const strats = cutoffs.map((c, i) => {
    const prev = data.pacing.strategy.autos
      .filter(s => rlt(s.onset, c.loc, 4))
      .pop() ||
        {
          onset: 0,
          point: data.plan.points[0]
        }

    const next = data.pacing.strategy.autos
      .find(s => rgt(s.onset, c.loc, 4)) ||
        {
          onset: data.plan.course.dist,
          point: _.last(data.plan.points)
        }

    // make sure we have points mapped
    if (!prev.point) prev.point = data.plan.getOrInsertPoint(prev.onset)
    if (!next.point) next.point = data.plan.getOrInsertPoint(next.onset)

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
      !data.pacing.strategy.autos.find(s3 => req(s3.onset, ss.onset, 4))
    ).map(s => s.value)
  const max = Math.max(...steps)
  const strat = strats.find(ss => ss.value === max)

  let added = false

  // every fourth iteration, if there is a strategy to add, do so
  if (i === 4 * (data.pacing.strategy.autos.length + 1) && strat) {
    added = true
    data.pacing.strategy.addAuto(strat)
  }

  // refine existing strategies on iterations where a new one isnt added
  if (!added) {
    data.pacing.strategy?.autos?.forEach((s, j) => {
      const strat = strats.find(ss => req(ss.onset, s.onset, 4))
      data.pacing.strategy.adjustAutoValue(s, strat.value)
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

async function createSegments (data) {
  // data: {[plan], [course]}
  if (data.plan && !data.course) data.course = data.plan.course

  // break on non-hidden waypoints:
  const wps = data.course.waypoints.filter(x => x.tier < 3).sort((a, b) => a.loc - b.loc)

  // get array of location breaks:
  data.breaks = wps.map(x => { return x.loc })

  // determine all the stuff
  const segments = await calcSegments(data)

  // map in waypoints
  segments.forEach((x, i) => {
    x.waypoint = wps[i + 1]
  })

  return segments
}

async function createSplits (data) {
  // data: {unit, [plan], [course]}
  if (data.plan && !data.course) data.course = data.plan.course

  const distScale = (data.unit === 'kilometers') ? 1 : 0.621371
  const tot = data.course.scaledDist * distScale

  const breaks = [0]
  let i = 1
  while (i < tot) {
    breaks.push(i / data.course.distScale / distScale)
    i++
  }
  if (tot / distScale > breaks[breaks.length - 1]) {
    breaks.push(tot / data.course.distScale / distScale)
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
  const splits = await calcSegments(data)

  return splits
}

exports.calcSegments = calcSegments
exports.calcPacing = calcPacing
exports.createSegments = createSegments
exports.createSplits = createSplits
