const winston = require('winston')

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (log) => `${log.timestamp}${log.file ? ' [' + log.file + ']' : ''}${log.method ? '[' + log.method + ']' : ''} ${log.level.toUpperCase()}: ${log.message}`
  )
)

winston.clear().add(new winston.transports.Console({
  format: winston.format.combine(
    format,
    winston.format.colorize({ all: true })
  )
}))

winston.addColors({ info: 'white' })

module.exports = winston
