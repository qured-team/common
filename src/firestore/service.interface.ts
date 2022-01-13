export interface Pager {
  limit: number
  start: number
}

export interface IIdentity {}

export type IBaseUpdatePicker<E extends IIdentity, K extends keyof E> = Pick<
  E,
  K
>

export interface IService<E extends IIdentity> {
  /**
   * @param {Pager}  pager - A string param.
   * @param {Record<string, any>} filters - An filters params
   * @param {string} orderBy - An optional param order by field should be indexed in firestore
   * @param {string} orderIndex - An optional param.
   * @return {Array<E>} This will be array objects of type E
   */
  get: (
    pager: Pager,
    filters?: Record<string, any>,
    orderBy?: string,
    orderIndex?: OrderIndex
  ) => Promise<Array<E>>

  /**
   * @param {Record<string, any>} filters - An filters params
   * @return {Array<E>} This will be array objects of type E
   */
  getBy: (filters: Record<string, any>) => Promise<Array<E>>

  /**
   * @param {string}  id - A string param.
   * @return {E} This will be single object of type E
   */
  getById: (id: string) => Promise<E>

  /**
   * @param {Record<string, any>} - A dto of an entity
   * @return {E} This will be single object of type E
   */
  add: (dto: Record<string, any>) => Promise<E>

  /**
   * @param {Record<string, any>} - array dtos of an entity
   * @return {Boolean} This will be truthly value.
   */
  addMany: (dtos: Record<string, any>[]) => Promise<boolean>

  /**
   * @param {string} - A string type param
   * @param {IBaseUpdatePicker<E, K>} - A dto for updating entity type E,
   * @return {boolean} This will return true/false
   */
  update: <E extends IIdentity, K extends keyof E>(
    id: string,
    data: IBaseUpdatePicker<E, K>
  ) => Promise<boolean>

  /**
   * @param {string} - A string type param
   * @return {boolean} This will return true/false
   */
  delete(id): Promise<boolean>

  /**
   * @param {Record<string, any>} - conditions object to update entities.
   * @return {boolean} This will return true/false
   */
  updateBy: <E extends IIdentity, K extends keyof E>(
    conditions: Record<string, any>,
    data: IBaseUpdatePicker<E, K>
  ) => Promise<boolean>
}

export type OrderIndex = 'desc' | 'asc'
