const factors = require('./factors')
const { round, rlt, rgt, rgte, req } = require('./util/math')
const { sleep } = require('./util')
const Segment = require('./models/Segment')
const { interpolatePoint } = require('./models/points')

const fKeys = factors.list

// creates an object with keys from fKeys above with initial values of init
function fObj (init) {
  const obj = {}
  fKeys.forEach(k => { const a = {}; a[k] = init; Object.assign(obj, a) })
  return obj
}

function facts (a, data) {
  const hasTOD = typeof (a.tod) !== 'undefined'
  return {
    grade: factors.grade(a.grade * (a.grade >= 0 ? data.course.gainScale : data.course.lossScale)),
    altitude: factors.altitude(a.alt, data.altModel),
    terrain: factors.terrain(a.loc, data.course.terrainFactors),
    heat: hasTOD && data.heatModel ? factors.heat(a.tod, data.heatModel) : 1,
    fatigue: 1,
    strategy: data.strategy.at(a.loc),
    dark: hasTOD && data.sun ? factors.dark(a.tod, factors.terrain(a.loc, data.course.terrainFactors), data.sun) : 1
  }
}

function calcSegments (p, breaks, pacing) {
  // p: points array of {loc, lat, lon, alt}
  // breaks: array of [loc,loc,...] to break on (start at 0)
  // pacing: pacing object with np and strategy fields

  const course = pacing.course

  // if strategy is not a strategy object, convert it
  if (!(pacing.strategy instanceof factors.Strategy)) {
    pacing.strategy = new factors.Strategy({
      values: pacing.strategy,
      length: course.dist
    })
  }

  const cLen = p[p.length - 1].loc
  const s = [] // segments array
  const alts = course.track.getLLA(breaks).map(lla => { return lla.alt })
  let len = 0
  let i
  let il
  const hasActuals = (p[0].actual !== undefined && p[p.length - 1].actual !== undefined)
  for (i = 1, il = breaks.length; i < il; i++) {
    len = breaks[i] - breaks[i - 1]
    s.push(new Segment({
      end: breaks[i],
      len: len,
      gain: 0,
      loss: 0,
      alt: alts[i], // ending altitude
      grade: (alts[i] - alts[i - 1]) / len / 10,
      delay: 0,
      factors: fObj(0),
      factor: 0,
      point1: course.insertPoint(breaks[i - 1]),
      point2: course.insertPoint(breaks[i])
    }))
  }

  const opts = {
    altModel: pacing.altModel,
    distance: cLen,
    strategy: pacing.strategy,
    sun: pacing.sun,
    heatModel: pacing.plan?.heatModel || null,
    course: course
  }
  const delays = (pacing && pacing.delays) ? [...pacing.delays] : []
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
  const hasPacing = Boolean(pacing && typeof (pacing.np) !== 'undefined')

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
        const fs = facts(a.p[0], opts)
        const len = a.p[1].loc - a.p[0].loc
        let f = 1
        fKeys.forEach(key => {
          a.s.factors[key] += fs[key] * len
          f = f * fs[key]
        })

        a.s.factor += f * len

        if (hasPacing) {
          a.s.delay += getDelay(a.p[0].loc, a.s.end)
        }
      })
      i++
    }
  }

  // normalize each factor by length and sum elapsed time
  s.forEach((x, i) => {
    Object.keys(s[i].factors).forEach(key => {
      s[i].factors[key] = x.factors[key] / x.len
    })
    s[i].factor = s[i].factor / x.len // overall norm factor
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

  data.strategy = new factors.Strategy({
    values: data.plan.strategy,
    length: data.plan.course.dist
  })

  data.plan.course.terrainFactors?.forEach(tf => data.plan.course.insertPoint(tf.start))
  if (data.plan.adjustForCutoffs) {
    data.plan.cutoffs.forEach(c => {
      c.point = data.plan.course.insertPoint(c.loc)
    })
  }

  data.pacing = data.plan.pacing || {}
  if (!data.pacing.status) data.pacing.status = {}

  // add in maxTime, if applicable
  if (
    data.plan.adjustForCutoffs &&
    data.plan.cutoffs.length &&
    req(data.plan.cutoffs[data.plan.cutoffs.length - 1].loc, data.plan.course.dist, 4)
  ) {
    data.pacing.maxTime = data.plan.cutoffs[data.plan.cutoffs.length - 1].time
  } else {
    delete data.pacing.maxTime
  }

  const pacing = await iteratePaceCalc(data)
  Object.assign(data.pacing, pacing)

  // points for sensitivity test:
  const testPoints = options.testLocations.map(tl => data.plan.course.insertPoint(tl))

  let lastTest = []

  let i
  const tests = {}
  for (i = 0; i < maxIterations; i++) {
    // help front end run smoothly
    await sleep(50)

    const pacing = await iteratePaceCalc(data)
    Object.assign(data.pacing, pacing)

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

    // targetPassing test makes sure the final point is within a half second of target time
    const elapsed = data.plan.course.points[data.plan.course.points.length - 1].elapsed
    tests.target =
      data.plan.pacingMethod === 'time'
        ? data.pacing.maxTime
          ? Math.abs(Math.min(data.pacing.maxTime, data.plan.pacingTarget) - elapsed) < 0.5
          : Math.abs(data.plan.pacingTarget - elapsed) < 0.5
        : data.pacing.maxTime
          ? elapsed < data.pacing.maxTime + 0.5
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

  data.pacing.status.tests = tests
  data.pacing.status.success = i < maxIterations
  data.pacing.status.iterations = i

  if (data.plan.event?.sun) {
    const s = calcSunTime({
      points: data.plan.course.points,
      event: data.plan.event
    })
    Object.assign(data.pacing, s)
  }

  return data.pacing
}

function iteratePaceCalc (data) {
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays }
  const plan = Boolean(data.plan)

  // calculate course normalizing factor:
  let tot = 0
  const factorValues = fObj(0)
  const fstats = {
    max: fObj(0),
    min: fObj(100)
  }
  const p = data.plan.course.points
  let fs = {}
  let elapsed = 0
  const hasPacingData = plan && data.pacing && data.pacing.np
  if (hasPacingData) {
    p[0].elapsed = 0
    p[0].time = 0
    if (data.plan.event.startTime !== null) {
      p[0].tod = data.plan.event.startTime
    }
  }

  // variables & function for adding in delays:
  let delay = 0
  const delays = [...data.plan.delays]
  function getDelay (a, b) {
    if (!delays.length) { return 0 }
    while (delays.length && delays[0].loc < a) {
      delays.shift()
    }
    if (delays.length && delays[0].loc < b) {
      return delays[0].delay
    }
    return 0
  }
  const opts = {
    altModel: data.plan.course.altModel,
    distance: data.plan.course.dist,
    strategy: data.strategy,
    sun: data.plan.event.sun,
    heatModel: data.plan.heatModel,
    course: data.plan.course
  }
  let dloc = 0
  let dtime = 0
  for (let j = 1, jl = p.length; j < jl; j++) {
    dloc = p[j].loc - p[j - 1].loc
    // determine pacing factor for point
    fs = facts(p[j - 1], opts)
    let f = 1 // combined segment factor
    Object.keys(fs).forEach(k => {
      factorValues[k] += fs[k] * dloc
      f = f * fs[k]
      fstats.max[k] = Math.max(fstats.max[k], fs[k])
      fstats.min[k] = Math.min(fstats.min[k], fs[k])
    })
    tot += f * dloc
    if (hasPacingData) {
      dtime = data.pacing.np * f * dloc
      p[j].time = p[j - 1].time + dtime
      delay = getDelay(p[j - 1].loc, p[j].loc)
      elapsed += dtime + delay
      p[j].elapsed = elapsed
      if (data.plan.event.startTime !== null) {
        p[j].tod = (elapsed + data.plan.event.startTime) % 86400
      }
    }
  }
  fKeys.forEach(k => {
    factorValues[k] = round(factorValues[k] / data.plan.course.dist, 4)
  })
  const normFactor = (tot / data.plan.course.dist)

  delay = 0
  let time = 0
  let pace = 0
  let np = 0

  if (plan) {
    // calculate delay:
    data.plan.delays.forEach((x, i) => {
      delay += x.delay
    })

    function calcStuff (data, time) {
      if (data.pacing.maxTime) time = Math.min(data.pacing.maxTime, time)
      const pace = (time - delay) / data.plan.course.dist
      const np = pace / normFactor
      return {
        time: time,
        pace: pace,
        np: np
      }
    }

    // calculate time, pace, and normalized pace:
    if (data.plan.pacingMethod === 'time') {
      time = data.plan.pacingTarget
    } else if (data.plan.pacingMethod === 'pace') {
      pace = data.plan.pacingTarget * data.plan.course.distScale
      time = pace * data.plan.course.dist + delay
    } else if (data.plan.pacingMethod === 'np') {
      np = data.plan.pacingTarget * data.plan.course.distScale
      pace = np * normFactor
      time = pace * data.plan.course.dist + delay
    }
    ;({ time, pace, np } = calcStuff(data, time))
  }

  const pacing = {
    time: time,
    delay: delay,
    factors: factorValues,
    fstats: fstats,
    moving: time - delay,
    pace: pace,
    np: np,
    strategy: data.strategy,
    altModel: data.plan.course.altModel,
    sun: data.plan.event.sun || null
  }

  return pacing
}

function adjustForCutoffs (data, i) {
  // data is same as data objct in calcPacing
  // i is the iteration number

  // filter out any existing stragegy elements with negative values
  const cutoffs = data.plan.cutoffs.filter(c => rlt(c.loc, data.plan.course.dist, 4))

  const strats = cutoffs.map((c, i) => {
    const prev = data.strategy.autos
      .filter(s => rlt(s.onset, c.loc, 4))
      .pop() ||
       {
         onset: 0,
         point: data.plan.course.points[0]
       }
    const next = data.strategy.autos
      .find(s => rgt(s.onset, c.loc, 4)) ||
{
  onset: data.plan.course.dist,
  point: data.plan.course.points[data.plan.course.points.length - 1]
}
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
      !data.strategy.autos.find(s3 => req(s3.onset, ss.onset, 4))
    ).map(s => s.value)
  const max = Math.max(...steps)
  const strat = strats.find(ss => ss.value === max)

  let added = false

  // every fourth iteration, if there is a strategy to add, do so
  if (i === 4 * (data.strategy.autos.length + 1) && strat) {
    added = true
    data.strategy.addAuto(strat)
  }

  // refine existing strategies on iterations where a new one isnt added
  if (!added) {
    data.strategy?.autos?.forEach((s, j) => {
      const strat = strats.find(ss => req(ss.onset, s.onset, 4))
      data.strategy.adjustAutoValue(s, strat.value)
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

function createSegments (points, data = null) {
  // break on non-hidden waypoints:
  const wps = data.waypoints.filter(x => x.tier < 3).sort((a, b) => a.loc - b.loc)

  // get array of location breaks:
  const breaks = wps.map(x => { return x.loc })

  // determine all the stuff
  const segments = calcSegments(points, breaks, data)

  // map in _index and waypoints
  segments.forEach((x, i) => {
    x._index = i
    x.waypoint = wps[i + 1]
  })

  return segments
}

function createSplits (points, units, data = null) {
  const distScale = (units === 'kilometers') ? 1 : 0.621371
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

  // get the stuff
  const splits = calcSegments(points, breaks, data)

  return splits
}

exports.calcSegments = calcSegments
exports.calcPacing = calcPacing
exports.createSegments = createSegments
exports.createSplits = createSplits
