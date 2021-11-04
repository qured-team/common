export interface QueryFilter {
  key: string
  operator: Operator
  value: string | number
}

type Operator =
  | '=='
  | '!='
  | '<'
  | '>'
  | '>='
  | '<='
  | 'in'
  | 'not in'
  | 'array-contains'
  | 'array-contains-any'
