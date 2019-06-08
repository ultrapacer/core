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
      var len = 0
      var grade = 0
      len = points[i].loc - points[i - 1].loc
      if (i === 0 || i === points.length - 1) {
        grade = points[i].grade
      } else {
        grade = (points[i - 1].grade + points[i].grade) / 2
      }
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

function addLoc (p) {
  var gt = 0.075 // grade smoothing threshold
  var at = 0.050 // altitude smoothing threshold
  var d = 0
  var t0 = 0, t1=0, t2=0,t3=0,st01=0,st12=0, st23=0
  p[0].loc = 0
  for (var i = 1, il = p.length; i < il; i++) {
    d += (gpxParse.utils.calculateDistance(p[i - 1].lat, p[i - 1].lon, p[i].lat, p[i].lon))
    p[i].loc = d
  }
  p.forEach(x=>{x.alt0 = x.alt})
  for (i = 0, il < p.length; i < il; i++) {
    var a2s = 0
    var w = 0
    t0 = performance.now()
    var p2 = p.filter(x => x.loc >= p[i].loc - gt && x.loc <= p[i].loc + gt)
    t1 = performance.now()
    var gxyr = []
    var axyr = []
    // need to update this to make sure at least one other point is selected 
    // ahead and behind
    p2.forEach((x) => {
      w = (1 - ((Math.abs(p[i].loc - x.loc) / gt) ** 3)) ** 3
      gxyr.push([x.loc, x.alt0, w])
      if (Math.abs(p[i].loc - x.loc) <= at) {
        w = (1 - ((Math.abs(p[i].loc - x.loc) / at) ** 3)) ** 3
        axyr.push([x.loc, x.alt0, w])
      }
    })
    t2 = performance.now()
    var gab = linear_regression(gxyr)
    var aab = linear_regression(axyr)
    t3 = performance.now()
    p[i].grade = round(gab[0] / 10, 2)
    if (p[i].grade > 50) { p[i].grade = 50 }
    else if (p[i].grade < -50) { p[i].grade = -50 }
    p[i].alt = round((p[i].loc * aab[0]) + aab[1], 2)
    st01 += t1 - t0
    st12 += t2 - t1
    st23 += t3 - t2
  }
  console.log(p)
  console.log('st01 ' + st01)
  console.log('st12 ' + st12)
  console.log('st23 ' + st23)
  return p
}



function linear_regression( xyr )
{
    var i, 
        x, y, r,
        sumx=0, sumy=0, sumx2=0, sumy2=0, sumxy=0, sumr=0,
        a, b;

    for(i=0;i<xyr.length;i++)
    {   
        // this is our data pair
        x = xyr[i][0]; y = xyr[i][1]; 

        // this is the weight for that pair
        // set to 1 (and simplify code accordingly, ie, sumr becomes xy.length) if weighting is not needed
        r = xyr[i][2];  

        // consider checking for NaN in the x, y and r variables here 
        // (add a continue statement in that case)

        sumr += r;
        sumx += r*x;
        sumx2 += r*(x*x);
        sumy += r*y;
        sumy2 += r*(y*y);
        sumxy += r*(x*y);
    }

    // note: the denominator is the variance of the random variable X
    // the only case when it is 0 is the degenerate case X==constant
    b = (sumy*sumx2 - sumx*sumxy)/(sumr*sumx2-sumx*sumx);
    a = (sumr*sumxy - sumx*sumy)/(sumr*sumx2-sumx*sumx);

    return [a, b];
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

function resampleLLA (lla) {
  // this routine isn't ready yet
  var th = 0.010 // threshold, meters
  var lla2 = []
  var l0 = 0
  var l = 0
  for (var i = 1, il = lla.length; i < il; i++) {
    var p1 = new sgeo.latlon(points[i - 1].lat, points[i - 1].lon)
    var p2 = new sgeo.latlon(points[i].lat, points[i].lon)
    l += Number(p1.distanceTo(p2))
  }
  addLoc(points)
  var l = points[points.length - 1].loc
  var n = Math.floor(l/0.005) + 1
  if (n < points.length) {
    var locs = Array.from({length: n}, (v, k) => 0.005*k++)
    var p = []
    for (var i = 0, il = locs.length; i < il; i++) {
      p.push(getLatLonAltFromDistance (points, locs[i]))
    }
    p.forEach(function(v){
      delete v.loc
      delete v.ind
    })
    return p
  } else {
    points.forEach(function(v){ delete v.loc })
    return points
  }
}

function round (num, digits) {
  return Math.round(num * (10 ** digits)) / 10 ** digits
}

function interp (x0, x1, y0, y1, x) {
  return y0 + (x - x0)/(x1 - x0) * (y1 - y0)
}

module.exports = {
  addLoc: addLoc,
  calcStats: calcStats,
  calcSplits: calcSplits,
  cleanPoints: cleanPoints,
  calcSegments: calcSegments,
  getElevation: getElevation,
  getLatLonAltFromDistance: getLatLonAltFromDistance,
  resampleLLA: resampleLLA
}
