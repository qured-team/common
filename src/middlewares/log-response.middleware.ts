import { Logger } from '../qured-logger'
import { Request, Response } from 'express'

export const requestInterceptor = (req: Request, res: Response) => {
  return {
    isInterceptable: () => {
      const contentType = res.get('Content-Type')
      const isJson = contentType?.includes('application/json')
      if (!isJson) {
        console.log(
          `Skiping the request logging as content type: ${contentType} is not json.`
        )
      }
      return isJson
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
