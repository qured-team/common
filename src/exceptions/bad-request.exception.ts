import { HttpException } from ".";

export class BadRequestException extends HttpException {
    constructor(message: string) {
      super(400, message)
    }
  }