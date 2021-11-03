import winston, { format } from 'winston'
import expressWinston from 'express-winston'
import { LoggingWinston } from '@google-cloud/logging-winston'

const isProduction = process.env.NODE_ENV === 'production'

const loggingWinston = new LoggingWinston()
const transports: winston.transport[] = [new winston.transports.Console()]
const { printf } = format

if (isProduction) {
  transports.push(loggingWinston)
}

const options = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}

/**
 * All-purpose logger
 */
export const logger = winston.createLogger(options)

const myFormat = printf(({ level, message }) => {
  return `[${level}] : ${message} `
})

/**
 * Express request logger
 */
export const requestLogger = () => {
  expressWinston.requestWhitelist.push('body')
  return expressWinston.logger({
    transports: [new winston.transports.Console({ level: 'info' })],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
      myFormat
    ),
    // msg: 'HTTP {{req.method}} {{req.url}} {{req.body}} {{res.statusCode}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  })
}
/**
 * Express error logger
 */
export const errorLogger = () => {
  return expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    msg: 'HTTP {{req.method}} {{req.url}} {{req.body}} {{res.statusCode}}',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    )
  })
}
