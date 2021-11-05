export const  requestInterceptor = (
  req: Express.Request,
  res: Express.Response,
  log: any
) => {
  return {
    isInterceptable: () => {
      return true
    },
    intercept: (body, send) => {
      try {
        log.resBody = JSON.parse(body)
      } catch (error) {
        log.resBody = {
          info: "Can't display response"
        }
      }
      send(body)
      return
    }
  }
}
