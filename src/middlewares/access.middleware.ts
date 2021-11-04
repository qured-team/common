import { HttpException } from 'exceptions'
import { NextFunction, Request, Response } from 'express'

const access = (api_access_code?: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ACCESS_CODE = !api_access_code
    ? process.env.ACCESS_CODE
    : api_access_code

  const accessCode = req.query['access_code']

  if (accessCode === ACCESS_CODE) {
    next()
  } else {
    next(new HttpException(404, 'Access denied'))
  }
}

export default access
