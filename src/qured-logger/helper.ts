import { Log, Logging } from '@google-cloud/logging'
import winston from 'winston'
import { LogEntry } from '@google-cloud/logging/build/src/entry'

import fs from 'fs'

import { LOGS_SEVERITY } from './options'
import { X_CORRELATION_HEADER } from '../utilities/utils'
import { IRequestContext } from '../middlewares'

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
  private cleanUp(body) {
    try {
      if (body?.operationName === 'createPassportImage') {
        const { image } = body?.variables?.input
        const { b64Image, ...restImage } = image ?? {}

        body.variables.input.image = image
          ? {
              ...restImage
            }
          : {}
      }

      if (body?.operationName === 'createPassportImageAndKit') {
        const { image } = body?.variables?.inputPassportImage
        const { b64Image, ...restImage } = image ?? {}

        body.variables.inputPassportImage.image = image
          ? {
              ...restImage
            }
          : {}
      }

      if (body?.data?.getPassportImage) {
        delete body?.data?.getPassportImage?.b64Image
      }

      if (body?.image?.b64Image) {
        delete body.image.b64Image
      }

      return body
    } catch (e) {
      console.error(e)
      this.error(e.message, undefined, e)
    }
  }

  private getTraceId(context: IRequestContext) {
    return context?.correlationId
      ? `projects/${serviceAccount.project_id}/traces/${context?.correlationId}`
      : globalLogFields['logging.googleapis.com/trace']
  }

  /*
    Different log type
  */
  request(req, res, time) {
    if (cloudLoggingOff) return

    const body = this.cleanUp(req.body)
    const rawBody = this.cleanUp(this.resBody)

    const input = {
      ...body
    }

    const output = {
      ...rawBody
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

  info(text, context?: IRequestContext, data?: Record<string, any>) {
    logger.info(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'INFO',
        trace: this.getTraceId(context),
        textPayload: text,
        jsonPayload: data
      },
      text
    )
    this.log.write(entry)
  }

  debug(text, context?: IRequestContext, data?: Record<string, any>) {
    logger.info(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'DEBUG',
        trace: this.getTraceId(context),
        textPayload: text,
        jsonPayload: data
      },
      text
    )
    this.log.write(entry)
  }

  warn(text, context?: IRequestContext, data?: Record<string, any>) {
    logger.warn(text)
    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'WARNING',
        trace: this.getTraceId(context),
        textPayload: text,
        jsonPayload: data
      },
      text
    )
    this.log.warning(entry)
  }

  error(
    text: string,
    context?: IRequestContext,
    error?: Error,
    data?: Record<string, any>
  ) {
    logger.error(text)

    if (cloudLoggingOff) return

    const entry = this.log.entry(
      {
        severity: 'ERROR',
        trace: this.getTraceId(context),
        textPayload: `${text} error: ${error?.message}`,
        jsonPayload: data
      },
      text
    )
    this.log.error(entry)
  }

  alert(text, context?: IRequestContext, data?: Record<string, any>) {
    const entry = this.log.entry(
      {
        severity: 'ALERT',
        trace: this.getTraceId(context),
        textPayload: text,
        jsonPayload: data
      },
      text
    )
    this.log.alert(entry)
  }
}

let gLogger: CloudLogging

export const Logger = gLogger || new CloudLogging()
