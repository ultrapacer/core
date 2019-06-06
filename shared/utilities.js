/* eslint new-cap: 0 */
const sgeo = require('sgeo')
const gpxParse = require('gpx-parse')
const gapModel = require('./gapModel')

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
  for (var i = 1, il = points.length; i < il; i++) {
    j = segments.findIndex(s => s.start < points[i].loc && s.end >= points[i].loc)
    if (j > j0) {
      // interpolate
      delta0 = (points[i].alt - points[i - 1].alt) * (segments[j].start - points[i - 1].loc) / (points[i].loc - points[i - 1].loc)
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
      var len = 0
      var grade = 0
      len = points[i].loc - points[i - 1].loc
      grade = (delta + delta0) / len / 10
      if (j > j0) {
        if (j0 >= 0) {
          segments[j0].time += pacing.gap * gapModel(grade) * (segments[j].start - points[i - 1].loc)
        }
        segments[j].time += pacing.gap * gapModel(grade) * (points[i].loc - segments[j].start)
      } else if (j >= 0) {
        segments[j].time += pacing.gap * gapModel(grade) * len
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

function addLoc (points) {
  var d = 0
  points[0].loc = 0
  for (var i = 1, il = points.length; i < il; i++) {
    d += (gpxParse.utils.calculateDistance(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon))
    points[i].loc = d
    points[i - 1].grade = round((points[i].alt - points[i - 1].alt) / (points[i].loc - points[i - 1].loc) / 10, 2)
  }
  points[points.length - 1].grade = 0
  return points
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

function getLatLonFromDistance (points, location) {
  var locs = []
  var lls = []
  if (Array.isArray(location)) {
    locs = [...location]
  } else {
    locs = [location]
  }
  location = locs.shift()
  for (var i = 0, il = points.length; i < il; i++) {
    if (points[i].loc >= location || i === il - 1) {
      if (points[i].loc === location || i === il - 1) {
        lls.push([points[i].lat, points[i].lon])
      } else {
        if (points[i + 1].loc === points[i].loc) {
          lls.push([points[i].lat, points[i].lon])
        } else {
          var p1 = new sgeo.latlon(points[i].lat, points[i].lon)
          var p2 = new sgeo.latlon(points[i + 1].lat, points[i + 1].lon)
          var inp = p1.interpolate(p2, 3)
          lls.push([inp[1].lat, inp[1].lng])
        }
      }
      location = locs.shift()
      if (location == null) {
        break
      }
    }
  }
  if (lls.length > 1) {
    return lls
  } else {
    return lls[0]
  }
}

function getLatLonAltFromDistance (points, location, start) {
  // if the start index is passed, make sure you go the right direction:
  var i0 = start || 0
  if (i0 > 0 && points[i0].loc > location) {
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

  for (var i = i0, il = points.length; i < il; i++) {
    if (points[i].loc >= location || i === il - 1) {
      if (points[i].loc === location || i === il - 1) {
        llas.push({
          lat: points[i].lat,
          lon: points[i].lon,
          alt: points[i].alt,
          ind: i
        })
      } else {
        if (points[i + 1].loc === points[i].loc) {
          llas.push({
            lat: points[i].lat,
            lon: points[i].lon,
            alt: (points[i + 1].alt + points[i].alt) / 2,
            ind: i
          })
        } else {
          var p1 = new sgeo.latlon(points[i].lat, points[i].lon)
          var p2 = new sgeo.latlon(points[i + 1].lat, points[i + 1].lon)
          var inp = p1.interpolate(p2, 3)
          llas.push({
            lat: inp[1].lat,
            lon: inp[1].lng,
            alt: points[i].alt + (location - points[i].loc) * (points[i + 1].alt - points[i].alt) / (points[i + 1].loc - points[i].loc),
            ind: i
          })
        }
      }
      location = locs.shift()
      if (location == null) {
        break
      }
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

module.exports = {
  addLoc: addLoc,
  calcStats: calcStats,
  calcSplits: calcSplits,
  cleanPoints: cleanPoints,
  calcSegments: calcSegments,
  getElevation: getElevation,
  getLatLonFromDistance: getLatLonFromDistance,
  getLatLonAltFromDistance: getLatLonAltFromDistance
}
