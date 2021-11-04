import cors, { CorsOptions } from 'cors'

export const httpCors = () => {
  const options: CorsOptions = {
    origin: true,
    credentials: true
  }

  return cors(options)
}
