import { Request } from "express"
import { X_CORRELATION_HEADER } from "../utilities/utils"

type IUser  = {
    id: string
}

export type IRequestContext = {
    correlationId: string
    user: IUser
}

export const getRequestContext = (req: Request): IRequestContext => {
    const correlationId = req.headers[X_CORRELATION_HEADER] as string
    return {
       correlationId,
       user: null,
    }
  }