import Joi from 'joi'

export const AuditDatatype = (schema: Record<string, any>) => {
  return Joi.object({
    ...schema,
    createdAt: Joi.date(),
    updatedAt: Joi.date()
  })
}
