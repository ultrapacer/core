const { interp } = require('../../util/math')
const defaults = require('./defaults')

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
  const fdark = (model.scale * ((tF - 1) * maxDarkScaleFactor)) + 1

  // routine to address tod rollover at midnight
  function offset (t) { return t < sun.solarNoon ? t + 86400 : t }

  if (!isNaN(sun.dawn) && !isNaN(sun.dusk) && (t <= sun.dawn || t >= sun.dusk)) {
    return fdark
  } else { // twilight, interpolate
    let f = 0
    if (offset(t) >= offset(sun.nadir)) { // dawn
      f = interp(
        offset(isNaN(sun.dawn) ? sun.nadir : sun.dawn),
        offset(sun.sunrise),
        fdark,
        1,
        offset(t)
      )
    } else { // dusk
      f = interp(
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
