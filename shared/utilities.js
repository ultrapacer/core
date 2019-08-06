/* eslint new-cap: 0 */
const sgeo = require('sgeo')
const gpxParse = require('gpx-parse')
const nF = require('./normFactor')

function calcStats (points) {
  var distance = 0
  var gain = 0
  var loss = 0
  var delta = 0
  for (var i = 0, il = points.length - 1; i < il; i++) {
    distance += (gpxParse.utils.calculateDistance(points[i].lat, points[i].lon, points[i + 1].lat, points[i + 1].lon))
    delta = points[i + 1].alt - points[i].alt
    if (delta < 0) {
      loss += delta
    } else {
      gain += delta
    }
  }
  return {
    distance: round(distance, 2),
    gain: Math.round(gain),
    loss: Math.round(loss)
  }
}

function calcSplits (points, units, pacing) {
  var distScale = 1
  if (units === 'mi') { distScale = 0.621371 }
  var tot = points[points.length - 1].loc * distScale

  // generate array of breaks in km
  var breaks = [0]
  var i = 1
  while (i < tot) {
    breaks.push(i / distScale)
    i++
  }
  if (tot / distScale > breaks[breaks.length - 1]) {
    breaks.push(tot / distScale)
  }
  if (pacing) {
    return calcSegments(points, breaks, pacing)
  } else {
    return calcSegments(points, breaks)
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
      len: len,
      gain: 0,
      loss: 0,
      alt1: alts[i - 1], // starting altitude
      alt2: alts[i], // ending altitude
      grade: (alts[i] - alts[i - 1]) / len / 10,
      time: 0
    })
  }
  var delta = 0
  var j = 0
  var j0 = 0
  var delta0 = 0
  var dF = 0
  var grade = 0
  var gF = 0 // grade factor
  var aF = 0 // altitude factor
  var tF = 0 // terrain factor
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
      ) - p[i].alt
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
      gF = nF.gradeFactor(grade)
      if (j > j0) {
        if (j0 >= 0) {
          len = s[j].start - p[i - 1].loc
          dF = nF.driftFactor([p[i - 1].loc, s[j].start], pacing.drift, cLen)
          aF = nF.altFactor([p[i - 1].alt, s[j].alt1], pacing.altModel)
          tF = nF.tF([p[i - 1].loc, s[j].start], pacing.tFs)
          s[j0].time += pacing.np * gF * dF * aF * tF * len
        }
        len = p[i].loc - s[j].start
        dF = nF.driftFactor([p[i].loc, s[j].start], pacing.drift, cLen)
        aF = nF.altFactor([p[i].alt, s[j].alt1], pacing.altModel)
        tF = nF.tF([p[i].loc, s[j].start], pacing.tFs)
        s[j].time += pacing.np * gF * dF * aF * tF * len
      } else if (j >= 0) {
        dF = nF.driftFactor([p[i - 1].loc, p[i].loc], pacing.drift, cLen)
        aF = nF.altFactor([p[i - 1].alt, p[i].alt], pacing.altModel)
        tF = nF.tF([p[i - 1].loc, p[i].loc], pacing.tFs)
        s[j].time += pacing.np * gF * dF * aF * tF * p[i].dloc
      }
    }
    j0 = j
  }
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
    x.grade = adj[i].grade
    x.alt0 = x.alt
    x.alt = adj[i].alt
  })
  return p
}

function pointWLSQ (p, locs, gt) {
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

function linearRegression (xyr) {
  var i
  var x
  var y
  var r
  var sumx = 0
  var sumy = 0
  var sumx2 = 0
  var sumxy = 0
  var sumr = 0
  var a
  var b

  for (i = 0; i < xyr.length; i++) {
    // this is our data pair
    x = xyr[i][0]; y = xyr[i][1]

    // this is the weight for that pair
    // set to 1 (and simplify code accordingly, ie, sumr becomes xy.length) if
    // weighting is not needed
    r = xyr[i][2]

    // consider checking for NaN in the x, y and r variables here
    // (add a continue statement in that case)

    sumr += r
    sumx += r * x
    sumx2 += r * (x * x)
    sumy += r * y
    sumxy += r * (x * y)
  }

  // note: the denominator is the variance of the random variable X
  // the only case when it is 0 is the degenerate case X==constant
  b = (sumy * sumx2 - sumx * sumxy) / (sumr * sumx2 - sumx * sumx)
  a = (sumr * sumxy - sumx * sumy) / (sumr * sumx2 - sumx * sumx)

  return [a, b]
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

function getLatLonAltFromDistance (points, location, start) {
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

function round (num, digits) {
  return Math.round(num * (10 ** digits)) / 10 ** digits
}

function interp (x0, x1, y0, y1, x) {
  return y0 + (x - x0) / (x1 - x0) * (y1 - y0)
}

module.exports = {
  addLoc: addLoc,
  calcStats: calcStats,
  calcSplits: calcSplits,
  cleanPoints: cleanPoints,
  calcSegments: calcSegments,
  getElevation: getElevation,
  getLatLonAltFromDistance: getLatLonAltFromDistance,
  pointWLSQ: pointWLSQ,
  round: round,
  interp: interp
}
