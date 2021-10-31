const winston = require('../core/log')

// use verbose logging in dev
if (window?.location?.origin?.includes?.('localhost')) {
  winston.level = 'verbose'

// use info logging on published beta:
} else if (window?.location?.origin?.includes?.('appspot.com')) {
  winston.level = 'info'

// use warn logging in production
} else {
  winston.level = 'warn'
}

module.exports = winston
