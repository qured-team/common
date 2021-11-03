import { Request, Response, NextFunction } from 'express'

import { OAuth2Client } from 'google-auth-library'

const oAuth2Client = new OAuth2Client()

export const authenticatedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')

    await oAuth2Client.verifyIdToken({ idToken: token })
  } catch (error) {
    res.status(500)
    res.json({ error: 'Unauthorized' })

    return
  }

  next()
}