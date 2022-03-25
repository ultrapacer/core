const winston = require('winston')

const dev = window?.location?.origin?.includes?.('localhost')

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (log) => {
      // this allows log.error(x) to pass "x" as an error object
      // and report error stack in develpment
      const message = dev && log.stack
        ? log.stack
        : log.message?.toString()

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

// use verbose logging in dev
if (dev) {
  winston.level = 'verbose'

// use info logging on published beta:
} else if (
  window?.location?.origin?.includes?.('appspot.com') ||
  window?.location?.origin?.includes?.('beta.')
) {
  winston.level = 'info'

// use warn logging in production
} else {
  winston.level = 'warn'
}

module.exports = winston
