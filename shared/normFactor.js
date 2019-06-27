// normFactor.js

var defaults = {
  altFactor: {
    rate: 0.68, // %
    span: 1000, // m
    th: 0 // m
  },
  gradeFactor: {
    // f = a*x^2 + b*x + c
    a: 0.0013,
    b: 0.0276,
    c: 0.0306
  }
}

function gradeFactor (grade, model) {
  if (typeof(model) === 'undefined') {
    model = defaults.gradeFactor
  }
  return model.a * (grade ** 2) + model.b * (grade) + model.c
}

function altFactor (alt, model) {
  console.log(model)
  if (typeof(model) === 'undefined' && Object.keys(model).length === 0) {
    model = defaults.altFactor
  }
  var a = 0
  if (Array.isArray(alt)) {
    a = (alt[0] + alt[1]) / 2
  } else {
    a = alt
  }
  var fact = (model.rate / 100) * Math.max(0, a - model.th) / model.span
  return fact
}

module.exports = {
  gradeFactor: gradeFactor,
  altFactor: altFactor,
  defaults: defaults
}
