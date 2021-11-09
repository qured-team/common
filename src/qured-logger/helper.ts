import { Log, Logging } from '@google-cloud/logging'
import winston from 'winston'
import { LogEntry } from '@google-cloud/logging/build/src/entry'

import fs from 'fs'

import { LOGS_SEVERITY } from './options'
import { X_CORRELATION_HEADER } from '../utilities/utils'

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
})

let cloudLoggingOff = process.env.CLOUD_LOGGING_OFF === 'true'
cloudLoggingOff =
  process.env.NODE_ENV !== 'development' ? false : cloudLoggingOff

const readServiceAccount = () => {
  const rowData = fs.readFileSync('service-account.json')
  return rowData.toString()
}

const getServiceAccount: any = () => {
  const account = process.env.SERVICE_ACCOUNT || readServiceAccount()

  return JSON.parse(account)
}

const serviceAccount = getServiceAccount()

// @todo list error and create code error
// @todo utility to fetch logs (from a client side) -> log.getEntries( {filter} )
// @todo check if there is 5 errors in last 20 logs -> severity EMERGENCY

let globalLogFields = {}
class CloudLogging {
  logging: Logging
  log: Log
  private logName: string

  /* @dev change resBody types */
  resBody: any

  /* 
      Initialisation of Google Cloud Logging client 

      @dev: change logName to the cloud run service name example "storage"
      
      401 (monolith) , 403 (cloud storage metadata), 500 (cloud storage mutation) - * (other) | 200 (good)
  */
  constructor() {
    this.logging = new Logging({
      projectId: serviceAccount?.project_id
    })

    this.logName = process.env.SERVICE

    this.log = this.logging.log(this.logName)
  }

  /*
    Log metadata

    @dev: resource.type should be "global" (to have log of each microservice at the same place)
  */
  private setupLogRequestMetadata(req, res, time) {
    const { originalUrl, method, headers } = req

    const { statusCode } = res

    const milliseconds = Math.floor(time)

    let severity = ''

    LOGS_SEVERITY.map((r) => {
      if (r.status.includes(statusCode)) {
        severity = r.severity
      }

      // @todo: default
    })

    const resource = {
      name: `${serviceAccount.project_id}/${process.env.SERVICE}`,
      type: 'global',
      labels: {
        zone: 'europe-west2'
      }
    }

    const httpRequest = {
      requestMethod: method,
      requestUrl: process.env.DOMAIN + originalUrl,
      status: statusCode,
      userAgent: headers['user-agent'],
      latency: {
        seconds: milliseconds / 1000
      },
      responseSize: headers['content-length']
    }

    const metadata: LogEntry = {
      severity: severity,
      resource,
      httpRequest
    }

    return metadata
  }

  /*  Clean up entry for heavy or private data

    @dev: change data to extract from logs
  */
  private cleanUp(body) {}

  /*
    Different log type
  */
  request(req, res, time) {
    const { body } = req

    const input = {
      ...body
    }

    const output = {
      ...this.resBody
    }

    const metadata = this.setupLogRequestMetadata(req, res, time)

    const entry = this.log.entry(
      { ...metadata, trace: globalLogFields['logging.googleapis.com/trace'] },
      input
    )

    this.log.write([entry, output])
  }

  setTraceId(req, res, next) {
    // Add log correlation to nest all log messages beneath request log in Log Viewer.
    // (This only works for HTTP-based invocations where `req` is defined.)
    if (typeof req !== 'undefined') {
      const trace = req.headers[X_CORRELATION_HEADER]
      if (trace && serviceAccount.project_id) {
        globalLogFields[
          'logging.googleapis.com/trace'
        ] = `projects/${serviceAccount.project_id}/traces/${trace}`
      }
    }
    next()
  }

  info(text) {
    logger.info(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'INFO',
        trace: globalLogFields['logging.googleapis.com/trace'],
        textPayload: text
      },
      text
    )
    this.log.write(entry)
  }
  warn(text) {
    logger.warn(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'WARNING',
        trace: globalLogFields['logging.googleapis.com/trace'],
        textPayload: text
      },
      text
    )
    this.log.warning(entry)
  }
  error(text) {
    logger.error(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'ERROR',
        trace: globalLogFields['logging.googleapis.com/trace'],
        textPayload: text
      },
      text
    )
    this.log.error(entry)
  }
  alert(text) {
    const entry = this.log.entry(
      {
        severity: 'ALERT',
        trace: globalLogFields['logging.googleapis.com/trace'],
        textPayload: text
      },
      text
    )
    this.log.alert(entry)
  }
}

let gLogger: CloudLogging

export const Logger = gLogger || new CloudLogging()
