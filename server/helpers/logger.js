const { consoleFormat } = require('winston-console-format')
const { createLogger, format, transports } = require('winston')

const customFormat = format.printf(info => {
  info.message = `${info.timestamp} | ${info.message}`
})

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'DD-MM-YY HH:MM:ss' }),
    format.ms(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        customFormat,
        format.colorize({ all: true }),
        format.padLevels(),
        consoleFormat({
          showMeta: true,
          metaStrip: ['service', 'timestamp'],
          inspectOptions: {
            depth: 3,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity
          }
        })
      )
    })
  ]
})

module.exports = logger
