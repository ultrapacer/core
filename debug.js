module.exports = (arg) => {
  const debug = require('debug')
  return debug('ultraPacer').extend(arg)
}
