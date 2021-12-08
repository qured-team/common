import fs from 'fs'
import readline from 'readline'

import _, { pickBy } from 'lodash'
import { formatISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

export const X_CORRELATION_HEADER = 'x-correlation-id'

const timeZone = 'Europe/London'

export const removeFalsey = <T extends Record<string, unknown>>(value: T) => {
  return pickBy(
    value,
    (value) => value !== null && !_.isNaN(value) && value !== ''
  )
}

export const isoNow = () => {
  const today = new Date()
  const currentTime = utcToZonedTime(today, timeZone)
  return formatISO(currentTime)
}

const readServiceAccount = async () => {
  const rowData = await fs.promises.readFile('service-account.json')

  return rowData.toString()
}

export const setServiceAccount = async () => {
  let account
  if (process.env.SERVICE_ACCOUNT) {
    account = process.env.SERVICE_ACCOUNT
  } else {
    account = await readServiceAccount()
  }
  const serviceAccount = JSON.parse(account)

  process.env.PROJECT_ID = serviceAccount.project_id
  process.env.CLIENT_EMAIL = serviceAccount.client_email
  process.env.LOCATION = process.env.LOCATION || 'europe-west2'
}

type IOption = {
  batchSize?: number
  hasHeader?: boolean
  splitter?: string
}

interface CallBack {
  (data: any[]): void
}

export const readCSVBatches = (
  path: string,
  callback: CallBack,
  options?: IOption,
  onClose?: Function
) => {
  const op = {
    ...{
      batchSize: 500,
      hasHeader: true,
      splitter: ','
    },
    ...options
  }
  const { batchSize, hasHeader, splitter } = op
  let batches = []
  let headers = []

  const readStream = readline.createInterface({
    input: fs.createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity
  })

  readStream.on('line', (line) => {
    const data = line.split(splitter)

    // if header row is present in csv
    if (hasHeader && !headers.length) {
      headers = data
      return
    }

    if (!hasHeader) {
      batches.push(data)
    } else {
      const mappedObj = data.reduce((obj, val, index) => {
        const property = headers[index]
        if (!obj[property]) {
          obj[property] = val
        }
        return obj
      }, {})
      batches.push(mappedObj)
    }

    if (batchSize !== batches.length) {
      return
    }

    callback(batches)
    batches = []
  })

  readStream.on('close', () => {
    if (batches.length !== 0) {
      callback(batches)
    }

    onClose && onClose()
  })
}
