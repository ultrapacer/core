// normFactor.js

var defaults = {
  alt: {
    rate: 4, // %
    span: 1000, // m
    th: 750 // m
  },
  gradeFactor: {
    // f = a*x^2 + b*x + c
    a: 0.0013,
    b: 0.0276,
    c: 0.0306
  }
}

function gradeFactor (grade, model) {
  if (model === null || typeof (model) === 'undefined') {
    model = defaults.gradeFactor
  }
  let fact = model.a * (grade ** 2) + model.b * (grade) + model.c
  return fact + 1
}

function altFactor (alt, model) {
  if (model === null || typeof (model) === 'undefined') {
    model = defaults.alt
  }
  var a = 0
  if (Array.isArray(alt)) {
    a = (alt[0] + alt[1]) / 2
  } else {
    a = alt
  }
  let r = model.rate / 100
  let fact = r * Math.max(0, a - model.th) / model.span
  return fact + 1
}

function driftFactor (loc, drift, length) {
  // returns a linear drift factor
  // loc: point or array [start, end] [km]
  // drift: in %
  // length: total course length [km]
  if (drift) {
    var mid = 0
    if (Array.isArray(loc)) {
      mid = (loc[0] + loc[1]) / 2
    } else {
      mid = loc
    }
    var dF = ((-drift / 2) + (mid / length * drift)) / 100
    return dF + 1
  } else {
    return 1
  }
}

function terrainFactor (loc, segments) {
  // returns a linear drift factor
  // loc: point or array [start, end] [km]
  // segments: array of segments with terrainIndex
  var mid = 0
  if (Array.isArray(loc)) {
    mid = (loc[0] + loc[1]) / 2
  } else {
    mid = loc
  }
  segments
}

module.exports = {
  gradeFactor: gradeFactor,
  altFactor: altFactor,
  driftFactor: driftFactor,
  defaults: defaults
}
