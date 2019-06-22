// normFactor.js

function gradeFactor (grade) {
  return 0.0013 * (grade ** 2) + 0.0276 * (grade) + 0.0306
}

function altFactor (alt, model) {
  var rate = 0.68 // %
  var span = 1000 // m
  var th = 0 // m
  if (model.hasOwnProperty('rate')) {
    rate = model.rate
    span = model.span
    th = model.threshold
  }
  var a = 0
  if (Array.isArray(alt)) {
    a = (alt[0] + alt[1]) / 2
  } else {
    a = alt
  }
  var fact = (rate / 100) * Math.max(0, a - th) / span
  return fact
}

module.exports = {
  gradeFactor: gradeFactor,
  altFactor: altFactor
}
