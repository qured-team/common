import { isoNow } from '../../utilities/utils'
import { firestore, DbError } from '../firestore'
import {
  IBaseUpdatePicker,
  IIdentity,
  IService,
  OrderIndex,
  Pager
} from '../service.interface'

export class BaseService<E extends IIdentity> implements IService<E> {
  constructor(private ENTITY_CLASS: string) {}

  get = async (
    pager: Pager,
    filters?: Record<string, any>,
    orderBy?: string,
    order?: OrderIndex
  ): Promise<Array<E>> => {
    try {
      const result: Array<E> = []

      let query: any = firestore.collection(this.ENTITY_CLASS)

      filters &&
        Object.keys(filters).forEach((key) => {
          query = query.where(key, '==', filters[key])
        })

      orderBy && query.orderBy(orderBy, order || 'desc')

      const snapshot = await query.limit(pager.limit).get()

      snapshot.forEach((element) => {
        const entity: E = {
          id: element.id,
          ...(element.data() as any)
        }

        result.push(entity)
      })
      return result
    } catch (error) {
      throw error
    }
  }

  getById = async (id: string): Promise<E> => {
    try {
      const user = await firestore.collection(this.ENTITY_CLASS).doc(id).get()

      if (!user.data()) {
        throw DbError('Cannot find code with this id')
      }
      return {
        id: user.id,
        ...(user.data() as any)
      }
    } catch (error) {
      throw error
    }
  }

  add = async (payload: any): Promise<E> => {
    try {
      const document = firestore.collection(this.ENTITY_CLASS).doc()
      const data = {
        createdAt: isoNow(),
        ...payload
      }

      const result = await document.set(data)

      if (!result) {
        throw DbError('Unable to add')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  updateBy = async <E extends IIdentity, K extends keyof E>(
    conditions: Record<string, any>,
    payload: IBaseUpdatePicker<E, K>
  ): Promise<boolean> => {
    let query: any = firestore.collection(this.ENTITY_CLASS)

    Object.keys(conditions).forEach((key) => {
      query = query.where(key, '==', conditions[key])
    })

    const snapshot = await query.get()
    if (snapshot.empty) {
      throw DbError('Cannot find entity.')
    }

    snapshot.forEach(async (element) => {
      const entity = await firestore
        .collection(this.ENTITY_CLASS)
        .doc(element.id)
        .update({
          ...payload
        })

      if (!entity) {
        throw DbError('Unable to update')
      }
    })
    return true
  }

  update = async <E extends IIdentity, K extends keyof E>(
    id: string,
    payload: IBaseUpdatePicker<E, K>
  ): Promise<boolean> => {
    try {
      const entity = await firestore
        .collection(this.ENTITY_CLASS)
        .doc(id)
        .update({
          ...payload,
          updatedAt: isoNow()
        })

      if (!entity) {
        throw DbError('Unable to update')
      }

      return true
    } catch (error) {
      throw error
    }
  }

  delete = async (id): Promise<boolean> => {
    const code = await firestore.collection(this.ENTITY_CLASS).doc(id).delete()

    if (!code) {
      throw DbError('Unable to update')
    }

    return true
  }
}
