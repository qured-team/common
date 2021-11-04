export class ApiError {
  code: number
  message: string

  constructor(code: number, message: string) {
    this.message = message
    this.code = code
  }

  static badRequest(message) {
    return new ApiError(400, message)
  }
}
