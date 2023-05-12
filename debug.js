const obj = {}
module.exports = (file) => {
  if (!obj[file]) {
    const debug = require('debug')('ultraPacer:core')
    debug(`loading debug for namespace "${file}"`)
    obj[file] = debug.extend(file)
  }
  return obj[file]
}
