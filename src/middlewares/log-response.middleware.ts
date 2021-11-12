import { Logger } from '../qured-logger'

export const requestInterceptor = (
  req: Express.Request,
  res: Express.Response
) => {
  return {
    isInterceptable: () => {
      return true
    },
    intercept: (body, send) => {
      try {
        Logger.resBody = JSON.parse(body)
      } catch (error) {
        Logger.error(`Failed to parse resBody: ${error?.message}`)
        Logger.resBody = {
          info: "Can't display response"
        }
      }
      send(body)
      return
    }
  }
}
