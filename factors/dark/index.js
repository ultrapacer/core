const defaults = require('./defaults')
const scale = require('./scale')

module.exports = function (tod, tF, sun, model) {
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
    model = defaults
  }
  // max dark scaling if never gets fully dark
  const maxDarkScaleFactor =
    sun.nadirAltitude < -6
      ? 1
      : -(sun.nadirAltitude / 6)

  // dark factor is a scaling of terrain
  const fdark = (model.scale * ((tF - 1) * maxDarkScaleFactor))

  // val will be between 0 and 1, where 0 is no additional and 1 is max
  const val = scale(sun, t)

  return 1 + (fdark * val)
}
