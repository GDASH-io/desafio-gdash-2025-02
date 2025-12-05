import bcrypt from "node_modules/bcryptjs"

export function generatePassowordHash(password: string):string {

  const hash = bcrypt.hashSync(password, 13)

  return hash
}