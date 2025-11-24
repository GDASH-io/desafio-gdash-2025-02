export interface ApiErrorType {
  statusCode: number
  error: string
  message: string
  details?: Array<{
    field: string
    message: string
  }>
}
