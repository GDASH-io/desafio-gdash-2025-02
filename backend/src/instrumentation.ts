import { connect as DbConnect } from "./db/connection";
import { PokemonsInsertAll } from "./handlers/pokedex";
import { createDefaultUser } from "./handlers/user";

export async function register() {
  await DbConnect()

  const password = process.env.DEFAULT_ADMIN_PASSWORD
  const email = "admin@email.com"
  if (password) {
    createDefaultUser(email, password)
    console.log(`Admin auth - email:${email} password:${password}`)
  }

  PokemonsInsertAll()
}