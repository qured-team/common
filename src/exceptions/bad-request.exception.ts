import { HttpException } from ".";

export default class BadRequestException extends HttpException {
    constructor(message: string) {
      super(400, message)
    }
  }