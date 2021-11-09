import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { X_CORRELATION_HEADER } from '../utilities/utils'

export const setCorrelationId = (req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers[X_CORRELATION_HEADER] || randomUUID()
    req.headers[X_CORRELATION_HEADER] = correlationId
    res.set(X_CORRELATION_HEADER, correlationId)
    next()
  }
