import { HttpException } from '../exceptions'
import { NextFunction, Request, Response } from 'express'
import { Logger } from '../qured-logger'
import { getRequestContext } from './request-context.middleware'

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const context = getRequestContext(req)

  try {
    let status: number = error?.status
    if (!status) {
      status = typeof error?.code === 'number' ? error.code : 500
    }
    const message: string = error?.message || 'Something went wrong'

    Logger.error(`http status : ${status}, errorMessage : ${message}`, context)

    res.status(status).json({ message })
  } catch (error) {
    next(error)
  }
}
