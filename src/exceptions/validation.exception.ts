import { ValidationError } from 'joi'
import { HttpException } from '.'

export class ValidationException extends HttpException {
  constructor(error: ValidationError) {
    super(422, error.message)
  }
}
