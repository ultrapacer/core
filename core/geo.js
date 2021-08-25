/* eslint new-cap: 0 */
const nF = require('./normFactor')
const { interp, round, wlslr } = require('./math')
const sgeo = require('sgeo')
const gpxParse = require('gpx-parse')
const { logger } = require('./logger')
const { Segment } = require('./segments')

function calcStats (points, smooth = true) {
  // return course { gain, loss, dist }
  const t = logger(`geo|calcStats smooth=${smooth}`)
  const d = points[points.length - 1].loc
  let gain = 0
  let loss = 0
  let delta = 0
  if (smooth) {
    const locs = points.map(x => x.loc)
    points = pointWLSQ(points, locs, 0.05)
  }
  let last = points[0].alt
  points.forEach(p => {
    delta = p.alt - last
    if (delta < 0) {
      loss += delta
    } else {
      gain += delta
    }
    last = p.alt
  })
  logger(`geo|calcStats smooth=${smooth}`, t)
  return {
    gain: gain,
    loss: loss,
    dist: d
  }
}

function interpp (p1, p2, s) {
  const p = {
    loc: s.end,
    grade: p1.grade
  }
  const fs = ['alt']
  const hasTOD = typeof (p1.tod) !== 'undefined' && typeof (p2.tod) !== 'undefined'
  if (hasTOD) { fs.push('tod') }
  fs.forEach(f => {
    p[f] = interp(
      p1.loc,
      p2.loc,
      p1[f],
      p2[f],
      s.end
    )
  })
  return p
}

function facts (a, b, data) {
  const hasTOD = typeof (a.tod) !== 'undefined' && typeof (b.tod) !== 'undefined'
  return {
    gF: nF.gF(a.grade),
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
  p = p.filter((x, i) => i === 0 || x.dloc > 0)
  const cLen = p[p.length - 1].loc
  const s = [] // segments array
  const alts = getElevation(p, breaks)
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
    heatModel: pacing.heatModel
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
        const p3 = interpp(p1, p2, s1)
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

function addLoc (p, distance = null) {
  // add loc & dloc fields
  // p: points array of {lat, lon, alt}
  let d = 0
  let l = 0
  p[0].loc = 0
  p[0].dloc = 0
  for (let i = 1, il = p.length; i < il; i++) {
    d = gpxParse.utils.calculateDistance(
      p[i - 1].lat,
      p[i - 1].lon,
      p[i].lat,
      p[i].lon
    )
    l += d
    p[i].dloc = d
    p[i].loc = l
  }

  // if specifying other distance, scale distances:
  if (distance) {
    if (round(p[p.length - 1].loc, 4) !== round(distance, 4)) {
      const scale = distance / p[p.length - 1].loc
      p.forEach((x, i) => {
        x.dloc = x.dloc * scale
        x.loc = x.loc * scale
      })
    }
  }

  return p
}

function addGrades (points) {
  // add grade field to points array
  const t = logger('geo|addGrades')
  const locs = points.map(x => x.loc)
  const lsq = pointWLSQ(points, locs, 0.05)
  points.forEach((p, i) => {
    p.grade = round(lsq[i].grade, 4)
  })
  logger('geo|addGrades', t)
  return points
}

function cleanUp (points) {
  // function fixes issues with tracks
  const t = logger('geo|cleanUp')
  // REMOVE ANY ZERO DISTANCE POINTS:
  const prev = points.length
  points = points.filter((p, i) => i === 0 || p.dloc > 0)
  if (prev > points.length) {
    logger(`geo|cleanUp: removed ${prev - points.length} zero-distance points`)
  }

  // REMOVE ALITITUDE STEPS FROM THE GPX. HAPPENS SOMETIMES WITH STRAVA DEM
  const at = 20 // meters step size
  const gt = 200 // % grade
  let i = 0
  // create array of step indices
  const steps = []
  while (i >= 0) {
    i = points.findIndex((p, j) =>
      j > i &&
      (
        Math.abs((p.alt - points[j - 1].alt)) > at ||
        Math.abs((p.alt - points[j - 1].alt) / p.dloc / 10) > gt
      )
    )
    if (i > 0) { steps.push(i) }
  }
  // for each step, find extents of adjacent flat sections and interp new alt
  steps.forEach(s => {
    let a = s - 1
    while (a >= 0 && points[s - 1].alt === points[a].alt) { a -= 1 }
    a += 1
    let z = s
    while (z <= points.length - 1 && points[s].alt === points[z].alt) { z += 1 }
    z -= 1
    if (z - a > 1) {
      logger(`geo|cleanUp: fixing altitude step at ${round(points[s].loc, 2)} km from ${round(points[a].alt, 2)} m to ${round(points[z].alt, 2)} m`)
      for (i = a + 1; i < z; i++) {
        points[i].alt = interp(
          points[a].loc,
          points[z].loc,
          points[a].alt,
          points[z].alt,
          points[i].loc
        )
      }
    }
  }
  )
  logger('geo|cleanUp', t)
  return points
}

function pointWLSQ (points, locs, gt) {
  // p: points array of {loc, lat, lon, alt}
  // locs: array of locations (km)
  // gt: grade smoothing threshold
  const mbs = wlslr(
    points.map(p => { return p.loc }),
    points.map(p => { return p.alt }),
    locs,
    gt
  )
  const ga = []
  locs.forEach((x, i) => {
    let grade = mbs[i][0] / 10
    if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
    const alt = (x * mbs[i][0]) + mbs[i][1]
    ga.push({
      grade: grade,
      alt: alt
    })
  })
  return ga
}

function getElevation (points, location) {
  let locs = []
  const elevs = []
  let num = 0
  if (Array.isArray(location)) {
    locs = [...location]
  } else {
    locs = [location]
  }
  location = locs.shift()
  for (let i = 0, il = points.length; i < il; i++) {
    if (points[i].loc >= location || i === il - 1) {
      if (points[i].loc === location || i === il - 1) {
        elevs.push(points[i].alt)
      } else {
        if (points[i + 1].loc === points[i].loc) {
          elevs.push((points[i + 1].alt + points[i].alt) / 2)
        } else {
          num = points[i].alt + (location - points[i].loc) * (points[i + 1].alt - points[i].alt) / (points[i + 1].dloc)
          elevs.push(num)
        }
      }
      location = locs.shift()
      if (location == null) {
        break
      }
    }
  }
  if (elevs.length > 1) {
    return elevs
  } else {
    return elevs[0]
  }
}

function getLatLonAltFromDistance (points, location, start) {
  // if the start index is passed, make sure you go the right direction:
  let i0 = Math.min(start, points.length - 1) || 0
  if (i0 > 0 && (points[i0].loc > location)) {
    for (let j = i0; j >= 0; j--) {
      if (points[j].loc <= location) {
        i0 = j
        break
      }
    }
  }
  let locs = []
  const llas = []
  if (Array.isArray(location)) {
    locs = [...location]
  } else {
    locs = [location]
  }
  location = locs.shift()

  let i = 0
  while (i < points.length) {
    if (points[i].loc >= location || i === points.length - 1) {
      if (points[i].loc === location || i === points.length - 1) {
        llas.push({
          lat: points[i].lat,
          lon: points[i].lon,
          alt: points[i].alt,
          grade: points[i].grade,
          ind: i
        })
      } else {
        if (points[i + 1].loc === points[i].loc) {
          llas.push({
            lat: points[i].lat,
            lon: points[i].lon,
            alt: (points[i + 1].alt + points[i].alt) / 2,
            grade: (points[i + 1].grade + points[i].grade) / 2,
            ind: i
          })
        } else {
          const p1 = new sgeo.latlon(points[i - 1].lat, points[i - 1].lon)
          const p2 = new sgeo.latlon(points[i].lat, points[i].lon)
          const dist = location - points[i - 1].loc
          const brng = p1.bearingTo(p2)
          const p3 = p1.destinationPoint(brng, dist)
          llas.push({
            lat: Number(p3.lat),
            lon: Number(p3.lng),
            alt: interp(
              points[i - 1].loc,
              points[i].loc,
              points[i - 1].alt,
              points[i].alt,
              location
            ),
            grade: interp(
              points[i - 1].loc,
              points[i].loc,
              points[i - 1].grade,
              points[i].grade,
              location
            ),
            ind: i
          })
        }
      }
      location = locs.shift()
      if (location == null) {
        break
      }
    } else {
      i++
    }
  }
  if (llas.length > 1) {
    return llas
  } else {
    return llas[0]
  }
}

function reduce (points, distance = null) {
  // reduce density of points for processing
  // correct distance

  const spacing = 0.025 // meters between points
  if (
    points[0].loc === undefined ||
    (distance && (round(points[points.length - 1].loc, 4) !== round(distance, 4)))
  ) {
    addLoc(points, distance)
  }

  // only reformat if it cuts the size down in half
  if (points[points.length - 1].loc / spacing < points.length / 2) {
    const len = points[points.length - 1].loc
    const numpoints = Math.floor(len / spacing) + 1
    const xs = Array(numpoints).fill(0).map((e, i) => round(i++ * spacing, 3))
    if (xs[xs.length - 1] < len) {
      xs.push(len)
    }
    const adj = pointWLSQ(
      points,
      xs,
      2 * spacing
    )
    const llas = getLatLonAltFromDistance(points, xs, 0)

    // reformat
    const points2 = xs.map((x, i) => {
      return {
        loc: x,
        dloc: (i > 0) ? x - xs[i - 1] : 0,
        lat: round(llas[i].lat, 6),
        lon: round(llas[i].lon, 6),
        alt: round(adj[i].alt, 2),
        grade: round(adj[i].grade, 4)
      }
    })

    logger(`geo.reduce: Reduced from ${points.length} to ${points2.length} points`)
    return points2
  } else {
    const points2 = points.map((p, i) => {
      const p2 = { ...p }
      p2.grade = i > 0 ? (p.alt - points[i - 1].alt) / p.dloc / 10 : 0
      return p2
    })
    logger(`geo.reduce: Maintained ${points.length} points`)
    return points2
  }
}

function calcPacing (data) {
  const t = logger()
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays, heatModel, scales }
  let hasPlan = false
  if (data.plan) { hasPlan = true }

  // copy points array & clear out time data if not applicable to this plan
  const points = data.points.map(p => {
    const x = { ...p }
    if (!hasPlan) {
      delete x.elapsed
      delete x.time
      delete x.dtime
      delete x.tod
    } else if (data.event.startTime === null) {
      delete x.tod
    }
    return x
  })

  let pacing = iteratePaceCalc({
    course: data.course,
    plan: data.plan,
    points: points,
    pacing: data.pacing || null,
    event: data.event,
    delays: data.delays,
    heatModel: data.heatModel,
    scales: data.scales,
    terrainFactors: data.terrainFactors
  })

  // locations for sensitivity test:
  const tests = []
  for (let i = 1; i <= 10; i++) {
    tests.push(Math.floor(i * (points.length - 1) / 10))
  }

  // iterate solution:
  if (hasPlan && data.event.startTime !== null) {
    let lastTest = []
    let i
    for (i = 0; i < 20; i++) {
      pacing = iteratePaceCalc({
        course: data.course,
        plan: data.plan,
        points: points,
        pacing: pacing,
        event: data.event,
        delays: data.delays,
        heatModel: data.heatModel,
        scales: data.scales,
        terrainFactors: data.terrainFactors
      })
      const newTest = tests.map(x => { return points[x].elapsed })
      if (
        lastTest.length &&
        newTest.findIndex((x, j) => Math.abs(x - lastTest[j]) > 0.5) < 0
      ) {
        break
      }
      lastTest = [...newTest]
    }
    logger(`geo.iteratePaceCalc: ${i + 2} iterations`, t)
    const s = calcSunTime({
      points: points,
      event: data.event
    })
    pacing = { ...pacing, ...s }
  }

  logger('geo.calcPacing', t)

  return {
    points: points,
    pacing: pacing
  }
}

function iteratePaceCalc (data) {
  const t = logger()
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays, heatModel, scales }
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
  const opts = { altModel: data.course.altModel, terrainFactors: data.terrainFactors, distance: data.course.totalDistance(), drift: data.plan.drift, sun: data.event.sun, heatModel: data.heatModel }
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
      delay = getDelay(p[j - 1].loc, p[j].loc)
      elapsed += p[j].dtime + delay
      p[j].elapsed = elapsed
      if (data.event.startTime !== null) {
        p[j].tod = (elapsed + data.event.startTime) % 86400
      }
    }
  }
  Object.keys(factors).forEach(k => {
    factors[k] = round(factors[k] / data.course.totalDistance(), 4)
  })
  const normFactor = (tot / data.course.totalDistance())

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
      pace = (time - delay) / data.course.totalDistance()
      np = pace / normFactor
    } else if (data.plan.pacingMethod === 'pace') {
      pace = data.plan.pacingTarget
      time = pace * data.course.totalDistance() + delay
      np = pace / normFactor
    } else if (data.plan.pacingMethod === 'np') {
      np = data.plan.pacingTarget
      pace = np * normFactor
      time = pace * data.course.totalDistance() + delay
    }
  }

  const pacing = {
    scales: data.scales,
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

async function addActuals (points, actual) {
  // interpolate actual array to points lat/lon and add actual elapsed & loc
  const t = logger()
  actual = actual.map(p => {
    const x = { ...p }
    x.ll = new sgeo.latlon(p.lat, p.lon)
    return x
  })
  let MatchFailure = {}
  try {
    for (let index = 0; index < points.length; index++) {
      const p = points[index]
      // this requires a lot of processing; prevent browser from hanging:
      if (index % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 5))
      }

      const ll = new sgeo.latlon(p.lat, p.lon)
      // pick all points within the next "th"
      let j = 0
      let darr = []
      while (darr.length === 0 || j > darr.length / 3) {
        if (j !== 0) { actual.shift() }
        const ths = [0.050, 0.075, 0.100, 0.15, 0.2]
        for (let ith = 0; ith < ths.length; ith++) {
          darr = actual.filter(
            (a, i) => a.loc - actual[0].loc <= ths[ith] || i < 3
          ).map(a => {
            return Number(ll.distanceTo(a.ll))
          })
          j = darr.findIndex(d => d === Math.min(...darr))
          if (darr[j] < ths[ith]) { break }
        }
      }
      if (darr[j] === 0) {
        p.actual = {
          loc: actual[0].loc,
          elapsed: actual[0].elapsed
        }
      } else {
        const a1 = actual[j]
        const a2 = darr[j + 1] >= darr[j - 1] ? actual[j + 1] : actual[j - 1]
        const d1 = darr[j]
        const d2 = darr[j + 1] >= darr[j - 1] ? darr[j + 1] : darr[j - 1]
        if (d1 > 0.25) {
          MatchFailure = {
            match: false,
            point: p
          }
          throw MatchFailure
        }
        if (a2) {
          p.actual = {
            loc: interp(0, 1, a1.loc, a2.loc, d1 / (d1 + d2)),
            elapsed: interp(0, 1, a1.elapsed, a2.elapsed, d1 / (d1 + d2))
          }
        } else {
          p.actual = {
            loc: a1.loc,
            elapsed: a1.elapsed
          }
        }
      }
    }
    logger('geo|addActuals MATCH', t)
    return {
      match: true
    }
  } catch (e) {
    logger('geo|addActuals FAIL', t)
    return MatchFailure
  }
}

function arraysToObjects (arr) {
  if (!arr.length) return []
  if (arr[0].length === 3) {
    return arr.map(p => {
      return { lat: p[0], lon: p[1], alt: p[2] }
    })
  } else if (arr[0].length === 5) {
    return arr.map((p, i) => {
      return {
        loc: p[0],
        dloc: (i > 0) ? p[0] - arr[i - 1][0] : 0,
        lat: p[1],
        lon: p[2],
        alt: p[3],
        grade: p[4]
      }
    })
  } else {
    return []
  }
}

function processPoints (points, distance, gain, loss) {
  addLoc(points, distance)
  points = cleanUp(points)
  addGrades(points)
  const stats = calcStats(points, false)
  const scales = {
    gain: gain / stats.gain,
    loss: loss / stats.loss,
    grade: (gain - loss) / (stats.gain - stats.loss)
  }
  points.forEach((x) => {
    x.grade *= (x.grade > 0 ? scales.gain : scales.loss)
  })

  return {
    points: points,
    scales: scales
  }
}

function createTerrainFactors (waypoints) {
  const l = logger()
  if (!waypoints.length) { return [] }
  const wps = waypoints.sort((a, b) => a.loc() - b.loc())
  let tF = wps[0].terrainFactor()
  const tFs = wps.filter((x, i) => i < wps.length - 1).map((x, i) => {
    if (x.terrainFactor() !== null) { tF = x.terrainFactor() }
    return {
      start: x.loc(),
      end: wps[i + 1].loc(),
      tF: tF
    }
  })
  logger('segments|createTerrainFactors complete', l)
  return tFs
}

function createSegments (points, data = null) {
  const l = logger()
  // break on non-hidden waypoints:
  const wps = data.waypoints.filter(x => x.tier() < 3).sort((a, b) => a.loc() - b.loc())

  // get array of location breaks:
  const breaks = wps.map(x => { return x.loc() })

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
  const l = logger()
  const distScale = (units === 'kilometers') ? 1 : 0.621371
  const tot = points[points.length - 1].loc * distScale
  const breaks = [0]
  let i = 1
  while (i < tot) {
    breaks.push(i / distScale)
    i++
  }
  if (tot / distScale > breaks[breaks.length - 1]) {
    breaks.push(tot / distScale)
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

  logger(`segments|createSplits complete (${splits.length} ${units})`, l)
  return splits
}

function addTOD (segments, points, startTime = null) {
  if (startTime !== null && points[0].elapsed !== undefined) {
    segments.forEach((x) => {
      x.tod = (x.elapsed + startTime) % 86400
    })
  }
}

exports.addLoc = addLoc
exports.addGrades = addGrades
exports.calcStats = calcStats
exports.calcSegments = calcSegments
exports.cleanUp = cleanUp
exports.getElevation = getElevation
exports.getLatLonAltFromDistance = getLatLonAltFromDistance
exports.pointWLSQ = pointWLSQ
exports.reduce = reduce
exports.calcPacing = calcPacing
exports.addActuals = addActuals
exports.arraysToObjects = arraysToObjects
exports.processPoints = processPoints
exports.createSegments = createSegments
exports.createSplits = createSplits
exports.createTerrainFactors = createTerrainFactors
