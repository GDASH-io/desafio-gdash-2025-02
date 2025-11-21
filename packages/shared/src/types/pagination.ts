export interface PaginationParamsType {
  page: number
  limit: number
}

export interface PaginationMetadataType {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponseType<T> {
  items: T[]
  meta: PaginationMetadataType
}
