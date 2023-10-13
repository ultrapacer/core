import debug from 'debug'
const obj = {}

/**
 * create debug object prefixed with ultrapacer:app
 * @param {string} name namespace for debug object
 * @returns {object} debug object
 */
export function createDebug(name) {
  if (!obj[name]) {
    const d = debug('ultraPacer:core')
    d(`loading debug for namespace "${name}"`)
    obj[name] = d.extend(name)
  }
  return obj[name]
}
