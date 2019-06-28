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
  return model.a * (grade ** 2) + model.b * (grade) + model.c
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
  return fact
}

module.exports = {
  gradeFactor: gradeFactor,
  altFactor: altFactor,
  defaults: defaults
}
