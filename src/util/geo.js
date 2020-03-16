/* eslint new-cap: 0 */
import nF from './normFactor'
import { interp, round, wlslr } from './math'
import { logger } from '../plugins/logger'
const sgeo = require('sgeo')
const gpxParse = require('gpx-parse')

function calcStats (points, smooth = true) {
  // return course { gain, loss, dist }
  let t = logger(`geo|calcStats smooth=${smooth}`)
  let d = points[points.length - 1].loc
  var gain = 0
  var loss = 0
  var delta = 0
  if (smooth) {
    let locs = points.map(x => x.loc)
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

function calcSegments (p, breaks, pacing) {
  // p: points array of {loc, lat, lon, alt}
  // breaks: array of [loc,loc,...] to break on
  // pacing: pacing object with np and drift fields
  var cLen = p[p.length - 1].loc
  var s = [] // segments array
  var alts = getElevation(p, breaks)
  var len = 0
  var i
  var il
  let hasActuals = p[0].hasOwnProperty('actual')
  for (i = 1, il = breaks.length; i < il; i++) {
    len = breaks[i] - breaks[i - 1]
    s.push({
      start: breaks[i - 1],
      end: breaks[i],
      len: 0,
      gain: 0,
      loss: 0,
      alt1: alts[i - 1], // starting altitude
      alt2: alts[i], // ending altitude
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
    })
  }
  var delta = 0
  var j = 0
  var j0 = 0
  var delta0 = 0
  var grade = 0
  let delays = (pacing) ? [...pacing.delays] : []
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
  let factors = {
    aF: 0, // altitude factor
    gF: 0, // grade factor
    tF: 0, // terrain factor
    hF: 0, // heat factor
    dark: 0, // dark factor
    dF: 0 // drift factor
  }
  let fk = Object.keys(factors)
  let hasTOD = p[0].hasOwnProperty('tod')
  for (i = 1, il = p.length; i < il; i++) {
    j = s.findIndex(x => x.start < p[i].loc && x.end >= p[i].loc)
    if (j > j0) {
      // interpolate
      delta0 = interp(
        p[i - 1].loc,
        p[i].loc,
        p[i - 1].alt,
        p[i].alt,
        s[j].start
      ) - p[i - 1].alt
      delta = p[i].alt - p[i - 1].alt - delta0
    } else {
      delta = p[i].alt - p[i - 1].alt
      delta0 = 0
    }
    if (j >= 0) {
      (delta < 0) ? s[j].loss += delta : s[j].gain += delta
    }
    if (j0 >= 0) {
      (delta0 < 0) ? s[j0].loss += delta0 : s[j0].gain += delta0
    }
    if (pacing && typeof (pacing.np) !== 'undefined') {
      grade = (p[i - 1].grade + p[i].grade) / 2
      factors.gF = nF.gradeFactor(grade)
      if (j > j0) {
        if (j0 >= 0) {
          len = s[j].start - p[i - 1].loc
          factors.dF = nF.driftFactor([p[i - 1].loc, s[j].start], pacing.drift, cLen)
          factors.aF = nF.altFactor([p[i - 1].alt, s[j].alt1], pacing.altModel)
          factors.tF = nF.tF([p[i - 1].loc, s[j].start], pacing.tFs)
          if (hasTOD) {
            let startTod = interp(
              p[i - 1].loc,
              p[i].loc,
              p[i - 1].tod,
              p[i].tod,
              s[j].start
            )
            factors.hF = nF.hF([p[i - 1].tod, startTod], pacing.heatModel)
            factors.dark = nF.dark([p[i - 1].tod, startTod], factors.tF, pacing.sun)
          } else {
            factors.hF = 1
            factors.dark = 1
          }
          let f = 1
          fk.forEach(k => {
            s[j0].factors[k] += factors[k] * len
            f = f * factors[k]
          })
          s[j0].time += pacing.np * f * len
          s[j0].len += len
          s[j0].delay += getDelay(p[i - 1].loc, s[j].start)
        }
        len = p[i].loc - s[j].start
        factors.dF = nF.driftFactor([p[i].loc, s[j].start], pacing.drift, cLen)
        factors.aF = nF.altFactor([p[i].alt, s[j].alt1], pacing.altModel)
        factors.tF = nF.tF([p[i].loc, s[j].start], pacing.tFs)
        if (hasTOD) {
          let startTod = (i < p.length - 1)
            ? interp(
              p[i].loc,
              p[i + 1].loc,
              p[i].tod,
              p[i + 1].tod,
              s[j].start
            )
            : p[i].tod
          factors.hF = nF.hF([p[i].tod, startTod], pacing.heatModel)
          factors.dark = nF.dark([p[i].tod, startTod], factors.tF, pacing.sun)
        } else {
          factors.hF = 1
          factors.dark = 1
        }
        let f = 1
        fk.forEach(k => {
          s[j].factors[k] += factors[k] * len
          f = f * factors[k]
        })
        s[j].time += pacing.np * f * len
        s[j].len += len
        s[j].delay += getDelay(s[j].start, p[i].loc)
      } else if (j >= 0) {
        factors.dF = nF.driftFactor([p[i - 1].loc, p[i].loc], pacing.drift, cLen)
        factors.aF = nF.altFactor([p[i - 1].alt, p[i].alt], pacing.altModel)
        factors.tF = nF.tF([p[i - 1].loc, p[i].loc], pacing.tFs)
        if (hasTOD) {
          factors.hF = nF.hF([p[i - 1].tod, p[i].tod], pacing.heatModel)
          factors.dark = nF.dark([p[i - 1].tod, p[i].tod], factors.tF, pacing.sun)
        } else {
          factors.hF = 1
          factors.dark = 1
        }
        let f = 1
        fk.forEach(k => {
          s[j].factors[k] += factors[k] * p[i].dloc
          f = f * factors[k]
        })
        s[j].time += pacing.np * f * p[i].dloc
        s[j].len += p[i].dloc
        s[j].delay += getDelay(p[i - 1].loc, p[i].loc)
      }
    }
    j0 = j
  }
  // normalize each factor by length and sum elapsed time
  let elapsed = 0
  s.forEach((x, i) => {
    Object.keys(s[i].factors).forEach(key => {
      s[i].factors[key] = x.factors[key] / x.len
    })
    elapsed += x.time + x.delay
    s[i].elapsed = elapsed
  })
  if (hasActuals) {
    delays = (pacing) ? [...pacing.delays] : []
    delays.forEach(d => {

    })
    s.forEach((seg, i) => {
      let p1 = p.find(point => point.loc >= seg.start)
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

function addLoc (p) {
  // add loc & dloc fields
  // p: points array of {lat, lon, alt}
  var d = 0
  var l = 0
  p[0].loc = 0
  p[0].dloc = 0
  for (var i = 1, il = p.length; i < il; i++) {
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
  return p
}

function addGrades (points) {
  // add grade field to points array
  let t = logger(`geo|addGrades`)
  let locs = points.map(x => x.loc)
  let lsq = pointWLSQ(points, locs, 0.05)
  points.forEach((p, i) => {
    p.grade = round(lsq[i].grade, 4)
  })
  logger(`geo|addGrades`, t)
  return points
}

export function pointWLSQ (points, locs, gt) {
  // p: points array of {loc, lat, lon, alt}
  // locs: array of locations (km)
  // gt: grade smoothing threshold
  let mbs = wlslr(
    points.map(p => { return p.loc }),
    points.map(p => { return p.alt }),
    locs,
    gt
  )
  var ga = []
  locs.forEach((x, i) => {
    var grade = mbs[i][0] / 10
    if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
    var alt = (x * mbs[i][0]) + mbs[i][1]
    ga.push({
      grade: grade,
      alt: alt
    })
  })
  return ga
}

function getElevation (points, location) {
  var locs = []
  var elevs = []
  var num = 0
  if (Array.isArray(location)) {
    locs = [...location]
  } else {
    locs = [location]
  }
  location = locs.shift()
  for (var i = 0, il = points.length; i < il; i++) {
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

export function getLatLonAltFromDistance (points, location, start) {
  // if the start index is passed, make sure you go the right direction:
  var i0 = Math.min(start, points.length - 1) || 0
  if (i0 > 0 && (points[i0].loc > location)) {
    for (var j = i0; j >= 0; j--) {
      if (points[j].loc <= location) {
        i0 = j
        break
      }
    }
  }
  var locs = []
  var llas = []
  if (Array.isArray(location)) {
    locs = [...location]
  } else {
    locs = [location]
  }
  location = locs.shift()

  var i = 0
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
          var p1 = new sgeo.latlon(points[i - 1].lat, points[i - 1].lon)
          var p2 = new sgeo.latlon(points[i].lat, points[i].lon)
          var dist = location - points[i - 1].loc
          var brng = p1.bearingTo(p2)
          var p3 = p1.destinationPoint(brng, dist)
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

export function reduce (points) {
  let spacing = 0.025 // meters between points
  if (!points[0].hasOwnProperty('loc')) {
    addLoc(points)
  }
  let len = points[points.length - 1].loc
  let numpoints = Math.floor(len / spacing) + 1
  let xs = Array(numpoints).fill(0).map((e, i) => round(i++ * spacing, 3))
  if (xs[xs.length - 1] < len) {
    xs.push(len)
  }
  let adj = pointWLSQ(
    points,
    xs,
    2 * spacing
  )
  let llas = getLatLonAltFromDistance(points, xs, 0)

  // reformat
  return xs.map((x, i) => {
    return {
      loc: x,
      dloc: (i > 0) ? x - xs[i - 1] : 0,
      lat: round(llas[i].lat, 6),
      lon: round(llas[i].lon, 6),
      alt: round(adj[i].alt, 2),
      grade: round(adj[i].grade, 4)
    }
  })
}

export function calcPacing (data) {
  let t = logger()
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays, heatModel, scales }
  var hasPlan = false
  if (data.plan) { hasPlan = true }

  // copy points array & clear out time data if not applicable to this plan
  let points = data.points.map(p => {
    let x = {...p}
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

  let kSplits = calcSplits({
    points: points,
    pacing: pacing,
    event: data.event,
    unit: 'kilometers'
  })

  // iterate solution:
  if (hasPlan && data.event.startTime !== null) {
    let lastSplits = kSplits.map(x => { return x.time })
    let elapsed = kSplits[kSplits.length - 1].elapsed
    for (var i = 0; i < 10; i++) {
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
      kSplits = calcSplits({
        points: points,
        pacing: pacing,
        event: data.event,
        unit: 'kilometers'
      })
      let hasChanged = false
      let newSplits = kSplits.map(x => { return x.time })
      for (let j = 0; j < newSplits.length; j++) {
        if (Math.abs(newSplits[j] - lastSplits[j]) >= 1) {
          hasChanged = true
          break
        }
      }
      if (
        !hasChanged &&
        Math.abs(elapsed - kSplits[kSplits.length - 1].elapsed) < 1
      ) { break }
      lastSplits = kSplits.map(x => { return x.time })
      elapsed = kSplits[kSplits.length - 1].elapsed
    }
    logger(`geo.iteratePaceCalc: ${i + 2} iterations`, t)
    let s = calcSunTime({
      points: points,
      event: data.event
    })
    pacing = {...pacing, ...s}
  }

  logger('geo.calcPacing', t)

  return {
    points: points,
    pacing: pacing
  }
}

function iteratePaceCalc (data) {
  let t = logger()
  // data { course, plan: plan, points: points, pacing: pacing, event: event, delays, heatModel, scales }
  var plan = false
  if (data.plan) { plan = true }

  // calculate course normalizing factor:
  var tot = 0
  var factors = {gF: 0, aF: 0, tF: 0, hF: 0, dark: 0, dF: 0}
  let fstats = {
    max: {gF: 0, aF: 0, tF: 0, hF: 0, dark: 0, dF: 0},
    min: {gF: 100, aF: 100, tF: 100, hF: 100, dark: 100, dF: 100}
  }
  var p = data.points
  let hasTOD = p[0].hasOwnProperty('tod')
  let fs = {}
  let elapsed = 0
  let hasPacingData = plan && data.pacing && data.pacing.np
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
  let delays = [...data.delays]
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

  for (let j = 1, jl = p.length; j < jl; j++) {
    // determine pacing factor for point
    fs = {
      gF: nF.gF((p[j - 1].grade + p[j].grade) / 2),
      aF: nF.aF([p[j - 1].alt, p[j].alt], data.course.altModel),
      tF: nF.tF([p[j - 1].loc, p[j].loc], data.terrainFactors),
      hF: (plan && p[1].tod) ? nF.hF([p[j - 1].tod, p[j].tod], data.heatModel) : 1,
      dF: nF.dF(
        [p[j - 1].loc, p[j].loc],
        plan ? data.plan.drift : 0,
        data.course.distance
      ),
      dark: 1
    }
    if (hasTOD) {
      fs.dark = nF.dark([p[j - 1].tod, p[j].tod], fs.tF, data.event.sun)
    }
    let len = p[j].loc - p[j - 1].loc
    let f = 1 // combined segment factor
    Object.keys(fs).forEach(k => {
      factors[k] += fs[k] * len
      f = f * fs[k]
      fstats.max[k] = Math.max(fstats.max[k], fs[k])
      fstats.min[k] = Math.min(fstats.min[k], fs[k])
    })
    tot += f * len
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
    factors[k] = round(factors[k] / data.course.distance, 4)
  })
  let normFactor = (tot / data.course.distance)

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
      pace = (time - delay) / data.course.distance
      np = pace / normFactor
    } else if (data.plan.pacingMethod === 'pace') {
      pace = data.plan.pacingTarget
      time = pace * data.course.distance + delay
      np = pace / normFactor
    } else if (data.plan.pacingMethod === 'np') {
      np = data.plan.pacingTarget
      pace = np * normFactor
      time = pace * data.course.distance + delay
    }
  }

  let pacing = {
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

export function calcSplits (data) {
  // data = {points, event, pacing, unit}
  let distScale = (data.unit === 'kilometers') ? 1 : 0.621371
  let tot = data.points[data.points.length - 1].loc * distScale
  let breaks = [0]
  let i = 1
  while (i < tot) {
    breaks.push(i / distScale)
    i++
  }
  if (tot / distScale > breaks[breaks.length - 1]) {
    breaks.push(tot / distScale)
  }
  let arr = calcSegments(data.points, breaks, data.pacing)
  if (data.event.startTime !== null && data.points[0].hasOwnProperty('elapsed')) {
    arr.forEach((x, i) => {
      arr[i].tod = (x.elapsed + data.event.startTime)
    })
  }
  return arr
}

function calcSunTime (data) {
  // data = {points, event}

  // time in sun zones:
  let sunType0 = ''
  let sunType = ''
  let s = {
    sunEventsByLoc: [],
    sunTime: {day: 0, twilight: 0, dark: 0},
    sunDist: {day: 0, twilight: 0, dark: 0}
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
        'sunType': sunType,
        loc: x.loc
      })
    }
    sunType0 = sunType
  })
  return s
}

export function addActuals (points, actual) {
  // interpolate actual array to points lat/lon and add actual elapsed & loc
  let t = logger()
  actual = actual.map(p => {
    let x = {...p}
    x.ll = new sgeo.latlon(p.lat, p.lon)
    return x
  })
  let MatchFailure = {}
  try {
    points.forEach(p => {
      let ll = new sgeo.latlon(p.lat, p.lon)
      // pick all points within the next "th"
      let j = 0
      let darr = []
      while (darr.length === 0 || j > darr.length / 3) {
        if (j !== 0) { actual.shift() }
        let ths = [0.050, 0.075, 0.100, 0.15, 0.2]
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
        let a1 = actual[j]
        let a2 = darr[j + 1] >= darr[j - 1] ? actual[j + 1] : actual[j - 1]
        let d1 = darr[j]
        let d2 = darr[j + 1] >= darr[j - 1] ? darr[j + 1] : darr[j - 1]
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
    })
    logger(`geo|addActuals MATCH`, t)
    return {
      match: true
    }
  } catch (e) {
    logger(`geo|addActuals FAIL`, t)
    return MatchFailure
  }
}

export default {
  addLoc: addLoc,
  addGrades: addGrades,
  calcStats: calcStats,
  calcSegments: calcSegments,
  getElevation: getElevation,
  getLatLonAltFromDistance: getLatLonAltFromDistance,
  pointWLSQ: pointWLSQ,
  reduce: reduce,
  calcPacing: calcPacing,
  calcSplits: calcSplits,
  addActuals: addActuals
}
