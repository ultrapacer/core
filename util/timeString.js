const _ = require('lodash')

/**
 * Returns a string with zero(s) preceding numbers.
 *
 * @param {Number} val - The input number.
 * @param {Number} len - The resuling length of string. Defaults to 2.
 * @return {String} A string with leading zero(s).
 */
function leftZero(val, len = 2) {
  if (val < 10 ** (len - 1)) {
    return `${'0'.repeat(len - String(val).length)}${val}`
  } else {
    return String(val)
  }
}

/**
 * Returns a formatted time string.
 *
 * @param {Number} val - The input number in seconds.
 * @return {String} A formatted time string in format hh:mm:ss, where the length will be trimmed
 *   to length with a minimum of "m:ss".
 */
function toString(val) {
  if (_.isNil(val)) return ''

  const hms = [Math.floor(val / 3600), Math.floor((val % 3600) / 60), Math.round(val % 60)]

  let string = hms.map((x) => leftZero(x)).join(':')

  // remove leading zeros (down to single digit minutes 0:XX)
  while (string.length > 4 && (string[0] === '0' || string[0] === ':')) {
    string = string.slice(1)
  }

  return string
}

module.exports = toString
