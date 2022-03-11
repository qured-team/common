import { NextFunction, Request, RequestHandler, Response } from 'express'
import { X_CORRELATION_HEADER } from '../utilities/utils'
import { createNamespace } from 'cls-hooked'
const ns = createNamespace('APP_NAMESPACE')

export const setRequestContext: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.headers[X_CORRELATION_HEADER] as string

  ns.run(() => {
    ns.set(X_CORRELATION_HEADER, correlationId)
    next()
  })
}
