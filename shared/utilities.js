/* eslint new-cap: 0 */
const sgeo = require('sgeo')
const gpxParse = require('gpx-parse')
const gnp = require('./gnp')

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

function calcSegments (points, breaks, pacing) {
  var cLen = points[points.length - 1].loc
  var cMid = cLen / 2
  var segments = []
  var alts = getElevation(points, breaks)
  for (var i = 1, il = breaks.length; i < il; i++) {
    segments.push({
      start: breaks[i - 1],
      end: breaks[i],
      len: breaks[i] - breaks[i - 1],
      gain: 0,
      loss: 0,
      grade: round((alts[i] - alts[i - 1]) / (breaks[i] - breaks[i - 1]) / 10, 4),
      time: 0
    })
  }
  var delta = 0
  var j = 0
  var j0 = 0
  var delta0 = 0
  function driftFact (mid) {
    if (pacing.drift) {
      var mid = (points[i].loc + points[i - 1].loc) / 2
      return 1 + (mid - cMid) / cLen * (pacing.drift / 100)
    } else {
      return 1
    }
  }
  for (var i = 1, il = points.length; i < il; i++) {
    j = segments.findIndex(s => s.start < points[i].loc && s.end >= points[i].loc)
    if (j > j0) {
      // interpolate
      delta0 = interp(
        points[i - 1].loc,
        points[i].loc,
        points[i - 1].alt,
        points[i].alt,
        segments[j].start
      ) - points[i].alt
      delta = points[i].alt - points[i - 1].alt - delta0
    } else {
      delta = points[i].alt - points[i - 1].alt
      delta0 = 0
    }
    if (j >= 0) {
      (delta < 0) ? segments[j].loss += delta : segments[j].gain += delta
    }
    if (j0 >= 0) {
      (delta0 < 0) ? segments[j0].loss += delta0 : segments[j0].gain += delta0
    }
    if (pacing) {
      var grade = 0
      if (i === 0) {
        grade = points[i].grade
      } else {
        grade = (points[i - 1].grade + points[i].grade) / 2
      }
      if (j > j0) {
        if (j0 >= 0) {
          var len = segments[j].start - points[i - 1].loc
          var mid = (segments[j].start + points[i - 1].loc) / 2
          segments[j0].time += pacing.gnp * gnp(grade) * driftFact(mid) * len
        }
        var len = points[i].loc - segments[j].start
        var mid = (points[i].loc + segments[j].start) / 2
        segments[j].time += pacing.gnp * gnp(grade) * driftFact(mid) * len
      } else if (j >= 0) {
        var len = points[i].loc - points[i - 1].loc
        var mid = (points[i].loc + points[i - 1].loc) / 2
        segments[j].time += pacing.gnp * gnp(grade) * driftFact(mid) * len
      }
    }
    j0 = j
  }
  return segments
}

function cleanPoints (points) {
  var points2 = []
  var avgQty = 1
  for (var i = 0, il = points.length; i < il; i++) {
    if (i > 0 && points[i].lat === points[i - 1].lat && points[i].lon === points[i - 1].lon) {
      points2[points2.length - 1].alt = round(((avgQty * points2[points2.length - 1].alt) + points[i].elevation) / (avgQty + 1), 2)
      avgQty += 1
    } else {
      avgQty = 1
      points2.push({
        alt: points[i].elevation,
        lat: points[i].lat,
        lon: points[i].lon
      })
    }
  }
  return points2
}

function addLoc (p) {
  var d = 0
  p[0].loc = 0
  for (var i = 1, il = p.length; i < il; i++) {
    d += (gpxParse.utils.calculateDistance(p[i - 1].lat, p[i - 1].lon, p[i].lat, p[i].lon))
    p[i].loc = d
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
    var grade = round(ab[0] / 10, 2)
    if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
    var alt = round((x * ab[0]) + ab[1], 2)
    ga.push({
      grade: grade,
      alt: alt
    })
  })
  return ga
}

function linearRegression (xyr) {
  var i,
    x, y, r,
    sumx = 0, sumy = 0, sumx2 = 0, sumy2 = 0, sumxy = 0, sumr = 0,
    a, b

  for (i = 0; i < xyr.length; i++) {
    // this is our data pair
    x = xyr[i][0]; y = xyr[i][1]

    // this is the weight for that pair
    // set to 1 (and simplify code accordingly, ie, sumr becomes xy.length) if weighting is not needed
    r = xyr[i][2]

    // consider checking for NaN in the x, y and r variables here
    // (add a continue statement in that case)

    sumr += r
    sumx += r * x
    sumx2 += r * (x * x)
    sumy += r * y
    sumy2 += r * (y * y)
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
          num = points[i].alt + (location - points[i].loc) * (points[i + 1].alt - points[i].alt) / (points[i + 1].loc - points[i].loc)
          elevs.push(round(num, 2))
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
  pointWLSQ: pointWLSQ
}
