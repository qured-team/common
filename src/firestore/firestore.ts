import { ApiError } from '../exceptions'
import fs from 'firebase-admin'

const initiateFirebaseApp = () => {
  if (process.env.NODE_ENV === 'local') {
    const certPath = '../../certs/firestore-cert.json'
    fs.initializeApp({
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      credential: fs.credential.cert(require(certPath))
    })
  } else {
    fs.initializeApp()
  }
}

initiateFirebaseApp()

export const firestore = fs.firestore()
firestore.settings({ ignoreUndefinedProperties: true })

export const DbError = (message: string) => {
  throw new ApiError(404, message)
}
