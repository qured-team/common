import { Log, Logging } from '@google-cloud/logging'
import winston from 'winston'
import { LogEntry } from '@google-cloud/logging/build/src/entry'

import fs from 'fs'

import { LOGS_SEVERITY } from './options'

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
  if (cloudLoggingOff) {
    return {}
  }
  const account = process.env.SERVICE_ACCOUNT || readServiceAccount()

  return JSON.parse(account)
}

const serviceAccount = getServiceAccount()

// @todo list error and create code error
// @todo utility to fetch logs (from a client side) -> log.getEntries( {filter} )
// @todo check if there is 5 errors in last 20 logs -> severity EMERGENCY

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

    const entry = this.log.entry(metadata, input)

    this.log.write([entry, output])
  }

  info(text) {
    logger.info(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(text)
    this.log.write(entry)
  }
  warn(text) {
    logger.warn(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'WARNING'
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
        severity: 'ERROR'
      },
      text
    )
    this.log.error(entry)
  }
  alert(text) {
    const entry = this.log.entry(
      {
        severity: 'ALERT'
      },
      text
    )
    this.log.alert(entry)
  }
}

let gLogger: CloudLogging

export const Logger = gLogger || new CloudLogging()
