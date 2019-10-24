/* eslint new-cap: 0 */
import nF from './normFactor'
import { interp, linearRegression } from './math'
const sgeo = require('sgeo')
const gpxParse = require('gpx-parse')

function calcStats (points) {
  var gain = 0
  var loss = 0
  var delta = 0
  for (var i = 0, il = points.length - 1; i < il; i++) {
    delta = points[i + 1].alt - points[i].alt
    if (delta < 0) {
      loss += delta
    } else {
      gain += delta
    }
  }
  return {
    gain: gain,
    loss: loss,
    dist: points[points.length - 1].loc
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
  return s
}

function cleanPoints (p) {
  // remove points with same lat/lon
  // p: points array of {lat, lon, elevation}
  // NOTE: elevation field gets renamed to alt here
  var p2 = []
  var avgQty = 1
  for (var i = 0, il = p.length; i < il; i++) {
    if (i > 0 && p[i].lat === p[i - 1].lat && p[i].lon === p[i - 1].lon) {
      p2[p2.length - 1].alt = ((avgQty * p2[p2.length - 1].alt) + p[i].elevation) / (avgQty + 1)
      avgQty += 1
    } else {
      avgQty = 1
      p2.push({
        alt: p[i].elevation,
        lat: p[i].lat,
        lon: p[i].lon
      })
    }
  }
  return p2
}

function addLoc (p) {
  // add loc, dloc, grade fields
  // update alt field with smoothed value
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

  var locs = p.map(x => x.loc)
  var adj = pointWLSQ(p, locs, 0.05)
  p.forEach((x, i) => {
    p[i].grade = adj[i].grade
    p[i].alt = adj[i].alt
  })
  return p
}

export function pointWLSQ (p, locs, gt) {
  // p: points array of {loc, lat, lon, alt}
  // locs: array of locations (km)
  // gt: grade smoothing threshold
  var ga = []
  var a = 0 // lower limit of p array
  var b = 0 // upper limit of p array
  locs.forEach(x => {
    while (p[a].loc < x - gt) { a++ }
    if (a > 0 && p[a].loc >= x) { a-- }
    while (b < p.length - 1 && p[b + 1].loc <= x + gt) { b++ }
    if (b < p.length - 1 && p[b].loc <= x) { b++ }

    // if necessary, increase threshold to include the point on either side:
    var igt = Math.max(
      gt,
      Math.abs(x - p[a].loc) + 0.001,
      Math.abs(x - p[b].loc) + 0.001
    )

    var xyr = []
    var w = 0
    for (var i = a; i <= b; i++) {
      w = (1 - ((Math.abs(x - p[i].loc) / igt) ** 3)) ** 3
      xyr.push([p[i].loc, p[i].alt, w])
    }

    var ab = linearRegression(xyr)
    var grade = ab[0] / 10
    if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
    var alt = (x * ab[0]) + ab[1]
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

export function reduce(points) {
  if (!points[0].hasOwnProperty('loc')) {
    addLoc(p)
  }
  let len = points[points.length - 1].loc
  let numpoints = Math.floor(len / 0.025) + 1
  let xs = Array(numpoints).fill(0).map((e, i) => round(i++ * 0.025, 3))
  if (xs[xs.length - 1] < len) {
    xs.push(len)
  }
  let adj = geo.pointWLSQ(
    points,
    xs,
    0.05
  )
  let llas = geo.getLatLonAltFromDistance(points, xs, 0)
        
  // reformat
  return xs.map((x, i) => {
    return {
      loc: x,   
      dloc: (i > 0) ? x[0] - xs[i - 1] : 0,
      lat: round(llas[i].lat, 6),
      lon: round(llas[i].lon, 6),
      alt: round(adj[i].alt, 2),
      grade: round(adj[i].grade, 4)
    }
  })
}

export default {
  addLoc: addLoc,
  calcStats: calcStats,
  cleanPoints: cleanPoints,
  calcSegments: calcSegments,
  getElevation: getElevation,
  getLatLonAltFromDistance: getLatLonAltFromDistance,
  pointWLSQ: pointWLSQ,
  reduce: reduce
}
