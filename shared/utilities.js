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
    distance: distance.toFixed(2),
    gain: gain.toFixed(0),
    loss: loss.toFixed(0)
  }
}

function calcSplits(points, units) {
  points = addLoc(points) // remove this later !!!
  var dist_scale = 1
  if (units == 'mi') { dist_scale = 0.621371 }
  var tot = points[points.length-1].loc * dist_scale
  
  // generate array of breaks in km
  var breaks = []
  var i = 1
  while (i < tot) {
    breaks.push(i)
    i++;
  }
  if (tot > breaks[breaks.length-1]) {
    breaks.push(tot)
  }
  
  var splits = []
  var distance = 0
  var split = 0
  var igain = 0
  var iloss = 0
  var delta = 0
  var brk = breaks.shift()
  for (var i = 1, il = points.length; i < il; i++) {
    if (points[i].loc < brk || i = il -1) {
      delta = points[i].alt - points[i-1].alt
    else {
      // interpolate
      delta = (points[i].alt - points[i-1].alt) * (brk - points[i-1].loc) / (points[i].loc - points[i-1].loc)
    }
    if (delta < 0) {
      iloss += delta 
    }
    else {
      igain += delta
    }
    if (points.loc >= brk) {
      splits.push({
        split: brk.toFixed(3),
        gain: igain,
        loss: iloss
      })
      brk = breaks.shift()
      igain = 0
      iloss = 0
    }
  }
  return splits
}

function cleanPoints(points) {
  var points2 = []
  for (var i=0, il= points.length; i<il; i++) {
    points2.push({
      alt: points[i].elevation,
      lat: points[i].lat,
      lon: points[i].lon
    })
	}
  return points2
}

function elevationProfile(points, distUnit, altUnit) {
  var distScale = 1
  var altScale = 1
  if (distUnit === 'mi') { distScale = 0.621371 }
  if (altUnit === 'ft') { altScale = 3.28084 }
  var distance = 0
  var data = []
  for (var i=0, il= points.length; i<il; i++) {
    data.push({
      x: distance * distScale,
      y: points[i].alt * altScale
    })
    if (i<points.length-1) {
      distance += (gpxParse.utils.calculateDistance(points[i].lat,points[i].lon,points[i+1].lat,points[i+1].lon ))
    }
  }
  return data
}

function addLoc(points) {
  var loc = 0
  for (var i=0, il= points.length; i<il; i++) {
    points[i].loc = loc
    if (i<points.length-1) {
      loc += (gpxParse.utils.calculateDistance(points[i].lat,points[i].lon,points[i+1].lat,points[i+1].lon ))
    }
  }
  return points
}

module.exports = {
  addLoc: addLoc,
  calcStats: calcStats,
  calcSplits: calcSplits,
  cleanPoints: cleanPoints,
  elevationProfile: elevationProfile
}
