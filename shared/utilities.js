const gpxParse = require('gpx-parse')

function calcStats(points) {
  var distance = 0
  var gain = 0
  var loss = 0
  var delta = 0
  for (var i=0, il= points.length -1; i<il; i++) {
    distance += (gpxParse.utils.calculateDistance(points[i].lat,points[i].lon,points[i+1].lat,points[i+1].lon ));
    delta = points[i+1].alt - points[i].alt
    if (delta < 0) {
      loss += delta
    }
    else {
      gain += delta
    }
  }
  return {
    distance: round(distance, 2),
    gain: Math.round(gain),
    loss: Math.round(loss)
  }
}

function calcSplits(points, units) {
  var dist_scale = 1
  if (units == 'mi') { dist_scale = 0.621371 }
  var tot = points[points.length-1].loc * dist_scale
  
  // generate array of breaks in km
  var breaks = [0]
  var i = 1
  while (i < tot) {
    breaks.push(i / dist_scale)
    i++
  }
  if (tot / dist_scale > breaks[breaks.length-1]) {
    breaks.push(tot / dist_scale)
  }
  return calcSegments(points,breaks)
}

function calcSegments(points,breaks) {
  var segments = []
  for (var i = 1, il = breaks.length; i < il; i++) {
    segments.push({
        start: breaks[i-1],
        end: breaks[i],
        len: breaks[i]-breaks[i-1],
        gain: 0,
        loss: 0
    })
  }
  function getSegmentIndex(dist){
    for (var i = 0, il = segments.length; i < il; i++) {
        if (dist > segments[i].start && dist <= segments[i].end) {
          return i
        }
    }
    return -1
  }
  var delta = 0
  var j = 0
  var j0 = 0
  var delta0 = 0
  for (var i = 1, il = points.length; i < il; i++) {
    if (i== il-1) {
      j = segments.length - 1
    } else {
      j = getSegmentIndex(points[i].loc)
    }
    if (j>j0) {
      // interpolate
      delta = (points[i].alt - points[i-1].alt) * (segments[j].start - points[i-1].loc) / (points[i].loc - points[i-1].loc)
      delta0 = points[i].alt - points[i-1].alt - delta
    } else {
      delta = points[i].alt - points[i-1].alt
      delta0 = 0
    }
    if (delta < 0) {
      segments[j].loss += delta 
    } else {
      segments[j].gain += delta 
    }
    if (delta0) {
      if (delta0 < 0) {
        segments[j0].loss += delta0
      } else {
        segments[j0].gain += delta0
      }
    }
    j0 = j
  }
  return segments
}

function cleanPoints(points) {
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

function addLoc(points) {
  var loc = 0
  var d = 0
  points[0].loc = 0
  for (var i = 1, il = points.length; i < il; i++) {
    d += (gpxParse.utils.calculateDistance(points[i-1].lat, points[i-1].lon, points[i].lat, points[i].lon))
    points[i].loc = d
  }
  return points
}

function getElevation(points, location) {
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
    if (points[i].loc >= location) {
      if (points[i].loc == location) {
        elevs.push(points[i].alt)
      } else {
        if (points[i+1].loc === points[i].loc) {
          elevs.push((points[i+1].alt + points[i].alt) / 2)
        } else {
          num = points[i].alt + (location - points[i].loc) * (points[i+1].alt - points[i].alt) / (points[i+1].loc - points[i].loc)
          elevs.push(round(num, 2))
        }
      }
      location = locs.shift()
      if (location == null) {
        if (elevs.length > 1) {
          return elevs
        } else {
          return elevs[0]
        }
      }
    }
  }
}

function round (num, digits) {
  return Math.round(num * (10**digits)) / 10**digits
}

module.exports = {
  addLoc: addLoc,
  calcStats: calcStats,
  calcSplits: calcSplits,
  cleanPoints: cleanPoints,
  calcSegments: calcSegments,
  getElevation: getElevation
}
