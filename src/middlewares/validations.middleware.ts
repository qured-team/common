import { ValidationException } from '../exceptions'
import { ObjectSchema } from 'joi'

export const validateRequestBody = <T>(schema: ObjectSchema<T>) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      stripUnknown: true
    })

    if (error) {
      return next(new ValidationException(error))
    }

    req.body = value as T

    next()
  }
}

export const validateRequestQuery = <T>(schema: ObjectSchema<T>) => {
  return async (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      stripUnknown: true
    })

    if (error) {
      return next(new ValidationException(error))
    }

    req.query = value as T

    next()
  }
}
