import { ValidationException } from 'exceptions'
import { Schema } from 'joi'

export const validateRequestBody = <T>(schema: Schema<T>) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)

    if (error) {
      return next(new ValidationException(error))
    }
    next()
  }
}
