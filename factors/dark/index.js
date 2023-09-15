const defaults = require('./defaults')
const scale = require('./scale')

/**
 * Return time-of-day based dark factor
 *
 * @param {Object}  args                  An object
 * @param {Number}  args.timeOfDaySeconds Time of day (in seconds)
 * @param {Number}  args.terrainFactor    Terrain %
 * @param {Object}  args.sun              Sun model, object w/ dawn, sunrise, sunset, dusk in time-of-day seconds
 * @param {Object}  [args.model]          Darkness model (see ./defaults)
 *
 * @return {Number} The heat factor at the provided point
 */
const getDarkFactor = ({ timeOfDaySeconds, terrainFactor, sun, model = defaults }) => {
  if (terrainFactor === 1) return 1

  if (timeOfDaySeconds >= sun.sunrise && timeOfDaySeconds <= sun.sunset) {
    return 1
  }
  if (model === null || typeof model === 'undefined') {
    model = defaults
  }
  // max dark scaling if never gets fully dark
  const maxDarkScaleFactor = sun.nadirAltitude < -6 ? 1 : -(sun.nadirAltitude / 6)

  // dark factor is a scaling of terrain
  const fdark = (model.terrainScale * (terrainFactor - 1) + model.baseline) * maxDarkScaleFactor

  // val will be between 0 and 1, where 0 is no additional and 1 is max
  const val = scale(sun, timeOfDaySeconds)

  return 1 + fdark * val
}

module.exports = getDarkFactor
