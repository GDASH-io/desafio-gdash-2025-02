import {ZodType} from 'zod'

export function validateUpdate<T>(schema: ZodType<T>, data: any){
  const result = schema.safeParse(data)
  let response:any[] = []

  if(!result.success) {
    result.error.issues.forEach(issue => response.push(
      {
        field: issue.path.join('.'),
        message: issue.message,
      }
    ))
  }

  return response;

}