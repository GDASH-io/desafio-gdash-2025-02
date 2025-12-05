import bcrypt from "node_modules/bcryptjs"

export async function comparePassword(password:string, storagedPassword: string) {
  return await bcrypt.compare(password, storagedPassword)
}