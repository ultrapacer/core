const winston = require('../core/log')

const dev = process.argv.includes('development')
if (dev) {
  winston.child({ file: 'log.js' }).info('logging in development mode')
} else {
  const { LoggingWinston } = require('@google-cloud/logging-winston')
  const loggingWinston = new LoggingWinston()
  winston.clear().add(loggingWinston)
  winston.child({ file: 'log.js' }).info('logging in production mode')
}

module.exports = winston
