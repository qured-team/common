import { NextFunction, Request, Response } from 'express'
import { X_CORRELATION_HEADER } from '../utilities/utils'
import { v4 as uuidv4 } from 'uuid'

export const setCorrelationId = (req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers[X_CORRELATION_HEADER] || uuidv4()
    req.headers[X_CORRELATION_HEADER] = correlationId
    res.set(X_CORRELATION_HEADER, correlationId)
    next()
  }
