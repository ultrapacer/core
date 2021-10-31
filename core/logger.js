// this is obsolete and just used until all project transitions to winston
const winston = require('winston')
function logger (message) {
  winston.verbose('use of core/logger.js is depreciated')
  if (message) return winston.info(message)
  return false
}
exports.logger = logger
