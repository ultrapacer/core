const nF = require('./normFactor')
const { round } = require('./math')
const { logger } = require('./logger')
const { Segment } = require('./segments')
const { interpolatePoint } = require('./points')

function facts (a, b, data) {
  const hasTOD = typeof (a.tod) !== 'undefined' && typeof (b.tod) !== 'undefined'
  return {
    gF: nF.gF(a.grade * (a.grade >= 0 ? data.course.gainScale : data.course.lossScale)),
    aF: nF.aF([a.alt, b.alt], data.altModel),
    tF: nF.tF([a.loc, b.loc], data.terrainFactors),
    hF: hasTOD && data.heatModel ? nF.hF([a.tod, b.tod], data.heatModel) : 1,
    dF: nF.dF(
      [a.loc, b.loc],
      data.drift,
      data.distance
    ),
    dark: hasTOD && data.sun ? nF.dark([a.tod, b.tod], nF.tF([a.loc, b.loc], data.terrainFactors), data.sun) : 1
  }
}

function calcSegments (p, breaks, pacing) {
  // p: points array of {loc, lat, lon, alt}
  // breaks: array of [loc,loc,...] to break on
  // pacing: pacing object with np and drift fields
  const cLen = p[p.length - 1].loc
  const s = [] // segments array
  const alts = pacing.course.track.getLLA(breaks).map(lla => { return lla.alt })
  let len = 0
  let i
  let il
  const hasActuals = (p[0].actual !== undefined)
  for (i = 1, il = breaks.length; i < il; i++) {
    len = breaks[i] - breaks[i - 1]
    s.push(new Segment({
      end: breaks[i],
      len: len,
      gain: 0,
      loss: 0,
      alt: alts[i], // ending altitude
      grade: (alts[i] - alts[i - 1]) / len / 10,
      time: 0,
      delay: 0,
      elapsed: 0,
      factors: {
        aF: 0,
        gF: 0,
        tF: 0,
        hF: 0,
        dark: 0,
        dF: 0
      }
    }))
  }
  const opts = {
    altModel: pacing.altModel,
    terrainFactors: pacing.tFs,
    distance: cLen,
    drift: pacing.drift,
    sun: pacing.sun,
    heatModel: pacing.heatModel,
    course: pacing.course
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
  const factors = {
    aF: 0, // altitude factor
    gF: 0, // grade factor
    tF: 0, // terrain factor
    hF: 0, // heat factor
    dark: 0, // dark factor
    dF: 0 // drift factor
  }
  const fk = Object.keys(factors)
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
        const fs = facts(a.p[0], a.p[1], opts)
        const len = a.p[1].loc - a.p[0].loc
        let f = 1
        fk.forEach(key => {
          a.s.factors[key] += fs[key] * len
          f = f * fs[key]
        })
        if (hasPacing) {
          a.s.time += pacing.np * f * len
          a.s.delay += getDelay(a.p[0].loc, a.s.end)
        }
      })
      i++
    }
  }

  // normalize each factor by length and sum elapsed time
  let elapsed = 0
  s.forEach((x, i) => {
    Object.keys(s[i].factors).forEach(key => {
      s[i].factors[key] = x.factors[key] / x.len
    })

    if (hasPacing) {
      elapsed += x.time + x.delay
      s[i].elapsed = elapsed
    }
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

function calcPacing (data) {
  const t = logger()
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays, heatModel }
  const hasPlan = Boolean(data.plan)

  let pacing = iteratePaceCalc({
    course: data.course,
    plan: data.plan,
    points: data.points,
    pacing: data.pacing || null,
    event: data.event,
    delays: data.delays,
    heatModel: data.heatModel,
    terrainFactors: data.terrainFactors
  })

  // locations for sensitivity test:
  const tests = []
  for (let i = 1; i <= 10; i++) {
    tests.push(Math.floor(i * (data.points.length - 1) / 10))
  }

  // iterate solution:
  if (hasPlan && data.event.startTime !== null) {
    let lastTest = []
    let i
    for (i = 0; i < 20; i++) {
      pacing = iteratePaceCalc({
        course: data.course,
        plan: data.plan,
        points: data.points,
        pacing: pacing,
        event: data.event,
        delays: data.delays,
        heatModel: data.heatModel,
        terrainFactors: data.terrainFactors
      })
      const newTest = tests.map(x => { return data.points[x].elapsed })
      if (
        lastTest.length &&
        newTest.findIndex((x, j) => Math.abs(x - lastTest[j]) > 0.5) < 0
      ) {
        break
      }
      lastTest = [...newTest]
    }
    logger(`geo.iteratePaceCalc: ${i + 2} iterations`, t)
    if (data.event?.sun) {
      const s = calcSunTime({
        points: data.points,
        event: data.event
      })
      pacing = { ...pacing, ...s }
    }
  }

  logger('geo.calcPacing', t)

  return pacing
}

function iteratePaceCalc (data) {
  const t = logger()
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays, heatModel }
  let plan = false
  if (data.plan) { plan = true }

  // calculate course normalizing factor:
  let tot = 0
  const factors = { gF: 0, aF: 0, tF: 0, hF: 0, dark: 0, dF: 0 }
  const fstats = {
    max: { gF: 0, aF: 0, tF: 0, hF: 0, dark: 0, dF: 0 },
    min: { gF: 100, aF: 100, tF: 100, hF: 100, dark: 100, dF: 100 }
  }
  const p = data.points
  let fs = {}
  let elapsed = 0
  const hasPacingData = plan && data.pacing && data.pacing.np
  if (hasPacingData) {
    p[0].elapsed = 0
    p[0].time = 0
    p[0].dtime = 0
    if (data.event.startTime !== null) {
      p[0].tod = data.event.startTime
    }
  }

  // variables & function for adding in delays:
  let delay = 0
  const delays = [...data.delays]
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
    altModel: data.course.altModel,
    terrainFactors: data.terrainFactors,
    distance: data.course.dist,
    drift: data.plan.drift,
    sun: data.event.sun,
    heatModel: data.heatModel,
    course: data.course
  }
  for (let j = 1, jl = p.length; j < jl; j++) {
    // determine pacing factor for point
    fs = facts(p[j - 1], p[j], opts)
    let f = 1 // combined segment factor
    Object.keys(fs).forEach(k => {
      factors[k] += fs[k] * p[j].dloc
      f = f * fs[k]
      fstats.max[k] = Math.max(fstats.max[k], fs[k])
      fstats.min[k] = Math.min(fstats.min[k], fs[k])
    })
    tot += f * p[j].dloc
    if (hasPacingData) {
      p[j].dtime = data.pacing.np * f * p[j].dloc
      p[j].time = p[j - 1].time + p[j].dtime
      delay = getDelay(p[j - 1].loc, p[j].loc)
      elapsed += p[j].dtime + delay
      p[j].elapsed = elapsed
      if (data.event.startTime !== null) {
        p[j].tod = (elapsed + data.event.startTime) % 86400
      }
    }
  }
  Object.keys(factors).forEach(k => {
    factors[k] = round(factors[k] / data.course.dist, 4)
  })
  const normFactor = (tot / data.course.dist)

  delay = 0
  let time = 0
  let pace = 0
  let np = 0

  if (plan) {
    // calculate delay:
    data.delays.forEach((x, i) => {
      delay += x.delay
    })

    // calculate time, pace, and normalized pace:
    if (data.plan.pacingMethod === 'time') {
      time = data.plan.pacingTarget
      pace = (time - delay) / data.course.dist
      np = pace / normFactor
    } else if (data.plan.pacingMethod === 'pace') {
      pace = data.plan.pacingTarget * data.course.distScale
      time = pace * data.course.dist + delay
      np = pace / normFactor
    } else if (data.plan.pacingMethod === 'np') {
      np = data.plan.pacingTarget * data.course.distScale
      pace = np * normFactor
      time = pace * data.course.dist + delay
    }
  }

  const pacing = {
    time: time,
    delay: delay,
    factors: factors,
    fstats: fstats,
    moving: time - delay,
    pace: pace,
    nF: nF,
    np: np,
    drift: plan ? data.plan.drift : 0,
    altModel: data.course.altModel,
    heatModel: data.heatModel,
    tFs: data.terrainFactors,
    delays: data.delays,
    sun: data.event.sun || null
  }

  logger('geo.iteratePaceCalc', t)
  return pacing
}

function calcSunTime (data) {
  // data = {points, event}

  // time in sun zones:
  let sunType0 = ''
  let sunType = ''
  const s = {
    sunEventsByLoc: [],
    sunTime: { day: 0, twilight: 0, dark: 0 },
    sunDist: { day: 0, twilight: 0, dark: 0 }
  }
  data.points.forEach((x, i) => {
    if (
      x.tod <= data.event.sun.dawn ||
      x.tod >= data.event.sun.dusk
    ) {
      sunType = 'dark'
      s.sunTime.dark += x.dtime
      s.sunDist.dark += x.dloc
    } else if (
      x.tod < data.event.sun.rise ||
      x.tod > data.event.sun.set
    ) {
      sunType = 'twilight'
      s.sunTime.twilight += x.dtime
      s.sunDist.twilight += x.dloc
    } else {
      sunType = 'day'
      s.sunTime.day += x.dtime
      s.sunDist.day += x.dloc
    }
    if (sunType !== sunType0) {
      s.sunEventsByLoc.push({
        sunType: sunType,
        loc: x.loc
      })
    }
    sunType0 = sunType
  })
  return s
}

function createTerrainFactors (waypoints) {
  const l = logger()
  if (!waypoints.length) { return [] }
  const wps = waypoints.sort((a, b) => a.loc - b.loc)
  let tF = wps[0].terrainFactor()
  const tFs = wps.filter((x, i) => i < wps.length - 1).map((x, i) => {
    if (x.terrainFactor() !== null) { tF = x.terrainFactor() }
    return {
      start: x.loc,
      end: wps[i + 1].loc,
      tF: tF
    }
  })
  logger('segments|createTerrainFactors complete', l)
  return tFs
}

function createSegments (points, data = null) {
  const l = logger()
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

  // map in time:
  addTOD(segments, points, data.startTime)

  logger(`segments|createSegments complete (${segments.length} segments)`, l)
  return segments
}

function createSplits (points, units, data = null) {
  logger(`segments|createSplits (${units})`)

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

  // map in time:
  addTOD(splits, points, data.startTime)

  return splits
}

function addTOD (segments, points, startTime = null) {
  if (startTime !== null && points[0].elapsed !== undefined) {
    segments.forEach((x) => {
      x.tod = (x.elapsed + startTime) % 86400
    })
  }
}

exports.calcSegments = calcSegments
exports.calcPacing = calcPacing
exports.createSegments = createSegments
exports.createSplits = createSplits
exports.createTerrainFactors = createTerrainFactors
