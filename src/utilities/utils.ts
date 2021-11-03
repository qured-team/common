import _, { pickBy } from 'lodash'
import { formatISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

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
