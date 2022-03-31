const winston = require('winston')

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (log) => {
      // this allows log.error(x) to pass "x" as an error object
      const message = log.stack
        ? log.stack
        : log.message.toString()

      // format the string:
      return `${log.timestamp}${log.file ? ' [' + log.file + ']' : ''}${log.method ? '[' + log.method + ']' : ''} ${log.level.toUpperCase()}: ${message}`
    }
  )
)

winston.clear().add(new winston.transports.Console({
  format: winston.format.combine(
    format,
    winston.format.colorize({ all: true })
  )
}))

winston.addColors({ info: 'white' })

const dev = process.argv.includes('development')
if (dev) {
  winston.child({ file: 'log.js' }).info('logging in development mode')
  winston.level = 'debug'
} else {
  const { LoggingWinston } = require('@google-cloud/logging-winston')
  const loggingWinston = new LoggingWinston({
    serviceContext: {
      service: process.env.K_SERVICE,
      version: process.env.K_REVISION
    }
  })
  winston.clear().add(loggingWinston)
  winston.child({ file: 'log.js' }).info('logging in production mode')
}

module.exports = winston
