import debug from 'debug'

type DebugDict = { [key: string]: debug.Debugger }
const obj: DebugDict = {}

/**
 * create debug object prefixed with ultrapacer:app
 * @param name - namespace for debug object
 * @returns debug object
 */
export function createDebug(name: string) {
  if (!obj[name]) {
    const d = debug('ultraPacer:core')
    d(`loading debug for namespace "${name}"`)
    obj[name] = d.extend(name)
  }
  return obj[name]
}
