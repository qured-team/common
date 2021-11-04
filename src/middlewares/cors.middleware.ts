import cors, { CorsOptions } from 'cors'

export default () => {
  const options: CorsOptions = {
    origin: true,
    credentials: true
  }

  return cors(options)
}
