import { HttpException } from '../exceptions'
import { NextFunction, Request, Response } from 'express'
import { Logger } from '../qured-logger'

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error.status || error.code || 500
    const message: string = error.message || 'Something went wrong'

    Logger.error(`StatusCode : ${status}, Message : ${message}`)

    res.status(status).json({ message })
  } catch (error) {
    next(error)
  }
}
