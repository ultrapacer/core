// normFactor.js

var defaults = {
  alt: {
    rate: 4, // %
    span: 1000, // m
    th: 750 // m
  },
  gradeFactor: {
    // f = a*x^2 + b*x + c
    a: 0.00155005,
    b: 0.03171216,
    c: 1.05768568
  }
}

function gradeFactor (grade, model) {
  if (model === null || typeof (model) === 'undefined') {
    model = defaults.gradeFactor
  }
  let fact = model.a * (grade ** 2) + model.b * (grade) + model.c
  return fact
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
  let r = model.rate / model.span / 100
  let fact = (1 + r) ** Math.max(0, a - model.th)
  return fact
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

function heatFactor (time, model = null) {
  // returns heat factor
  // time is time of day in milliseconds
  // model format:
  //    start:    tod, seconds
  //    stop:     tod, seconds
  //    max:      peak % increase in percent
  //    baseline: background factor
  if (model === null) {
    return 1
  }
  let t = 0
  if (Array.isArray(time)) {
    t = (time[0] + time[1]) / 2
  } else {
    t = time
  }
  let hF = 1
  if (t > model.start && t < model.stop) {
    let theta = (t - model.start) / (model.stop - model.start) * Math.PI
    hF += (model.max * Math.sin(theta)) / 100
  }
  hF += model.baseline / 100
  return hF
}

function terrainFactor (loc, tFs) {
  // returns a segment-based terrain factor
  // loc: loc [km] or array [start, end] [km]
  // tFs: array of terrainFactors [loc, tF] with terrainFactor
  var tF = tFs[0].tF

  if (!Array.isArray(loc)) {
    loc = [loc, loc]
  }
  tFs = tFs.filter(x =>
    x.start <= loc[1] && x.end >= loc[0]
  )
  if (tFs.length === 1 || loc[0] === loc[1]) {
    tF = tFs[0].tF
  } else {
    let wtF = 0
    tFs.forEach(x => {
      let l = Math.min(loc[1], x.end) -
        Math.max(loc[0], x.start)
      wtF += l * x.tF
    })
    tF = wtF / (loc[1] - loc[0])
  }
  return (tF / 100) + 1
}

module.exports = {
  gradeFactor: gradeFactor,
  gF: gradeFactor,
  altFactor: altFactor,
  aF: altFactor,
  driftFactor: driftFactor,
  dF: driftFactor,
  terrainFactor: terrainFactor,
  tF: terrainFactor,
  heatFactor: heatFactor,
  hF: heatFactor,
  defaults: defaults
}
