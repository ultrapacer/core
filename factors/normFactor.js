const mathUtil = require('../util/math')
const { driftFactor } = require('./driftFactor')
const { heatFactor } = require('./heatFactor')

const defaults = {
  alt: {
    rate: 6, // %
    span: 1000, // m
    th: 750 // m
  },
  gradeFactor: {
    // f = a*x^2 + b*x
    // goes linear at lower and upper bounds
    a: 0.0021,
    b: 0.0340,
    lower: {
      lim: -22,
      m: -0.0584,
      b: -0.0164
    },
    upper: {
      lim: 16,
      m: 0.1012,
      b: 0.4624
    }
  },
  dark: {
    // scaling of terrain factor applied in the dark to apply
    // as the darkness factor
    scale: 1
  }
}

function gradeFactor (grade, model) {
  if (model === null || typeof (model) === 'undefined') {
    model = defaults.gradeFactor
  }
  if (grade < model.lower.lim) {
    return model.lower.m * grade + model.lower.b
  } else if (grade > model.upper.lim) {
    return model.upper.m * grade + model.upper.b
  } else {
    return model.a * (grade ** 2) + model.b * (grade) + 1
  }
}

function altFactor (alt, model) {
  // returns an exponential altitude factor
  // alt: altitude [km]
  // model format:
  //    rate: % increase per span
  //    span: meters for % increase
  //      th: alt threshold where model starts [m]
  if (model === null || typeof (model) === 'undefined') {
    model = defaults.alt
  }
  let a = 0
  if (Array.isArray(alt)) {
    a = (alt[0] + alt[1]) / 2
  } else {
    a = alt
  }
  if (a <= model.th) {
    return 1
  } else {
    const r = model.rate / model.span / 100
    return (1 + r) ** (a - model.th)
  }
}

function terrainFactor (loc, tFs) {
  // returns a segment-based terrain factor
  // loc: loc [km] or array [start, end] [km]
  // tFs: array of terrainFactors [loc, tF] with terrainFactor
  let tF = tFs[0].tF

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
      const l = Math.min(loc[1], x.end) -
        Math.max(loc[0], x.start)
      wtF += l * x.tF
    })
    tF = wtF / (loc[1] - loc[0])
  }
  return (tF / 100) + 1
}

function darkFactor (tod, tF, sun, model) {
  // returns a time-of-day based dark factor
  // tod: time of day in seconds
  // tF: terrainFactor
  // sun: object w/ dawn, sunrise, sunset, dusk in time-of-day seconds
  // model format:
  //    scale: scaling factor for terrain factor
  if (tF === 1) { return 1 }
  let t = 0
  if (Array.isArray(tod)) {
    t = (tod[0] + tod[1]) / 2
  } else {
    t = tod
  }
  if (t >= sun.sunrise && t <= sun.sunset) {
    return 1
  }
  if (model === null || typeof (model) === 'undefined') {
    model = defaults.dark
  }
  // max dark scaling if never gets fully dark
  const maxDarkScaleFactor =
    sun.nadirAltitude < -6
      ? 1
      : -(sun.nadirAltitude / 6)

  // dark factor is a scaling of terrain
  const fdark = (model.scale * ((tF - 1) * maxDarkScaleFactor)) + 1

  // routine to address tod rollover at midnight
  function offset (t) { return t < sun.solarNoon ? t + 86400 : t }

  if (!isNaN(sun.dawn) && !isNaN(sun.dusk) && (t <= sun.dawn || t >= sun.dusk)) {
    return fdark
  } else { // twilight, interpolate
    let f = 0
    if (offset(t) >= offset(sun.nadir)) { // dawn
      f = mathUtil.interp(
        offset(isNaN(sun.dawn) ? sun.nadir : sun.dawn),
        offset(sun.sunrise),
        fdark,
        1,
        offset(t)
      )
    } else { // dusk
      f = mathUtil.interp(
        offset(sun.sunset),
        offset(isNaN(sun.dusk) ? sun.nadir : sun.dusk),
        1,
        fdark,
        offset(t)
      )
    }
    return f
  }
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
  dark: darkFactor,
  defaults: defaults
}
