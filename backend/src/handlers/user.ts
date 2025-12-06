import { findtUser, findtUserByEmail, insertUser, IUser, upsertUser } from "@/db/models/user";
import { reloadSession, SessionInternal } from "./session";
import { updateSessionSetUserId, updateSessionUnsetUserId } from "@/db/models/session";

async function loginUser(session: SessionInternal, userId: string): Promise<Boolean>  {
  const resp = await updateSessionSetUserId(session.id, userId)
  return resp != null
}

async function logoutUser(session: SessionInternal): Promise<Boolean> {
  const resp = await updateSessionUnsetUserId(session.id)
  return resp != null
}

export async function tryRegisterUser(name: string, email: string, password: string, session: SessionInternal): Promise<SessionInternal|null> {
  const testUser = await findtUserByEmail(email)
  if (testUser) {
    return null
  }

  const record = await insertUser({name: name, email: email, password: password})
  if (!record._id) {
    return null
  }
  if (!loginUser(session, record._id.toString())) {
    return null
  }
  return reloadSession(session)
}

export async function tryLoginUser(email: string, password: string, session: SessionInternal): Promise<SessionInternal|null> {
  const userDb = await findtUserByEmail(email)
  if (!userDb || userDb._id == undefined) {
    return null
  }

  if (userDb.password != password) {
    return null
  }

  if (!loginUser(session, userDb._id.toString())) {
    return null
  }
  return reloadSession(session)
}

export async function tryLogoutUser(session: SessionInternal): Promise<SessionInternal|null> {
  if (!session.user) {
    return null
  }

  const userDb = await findtUserByEmail(session.user.email)
  if (!userDb || userDb._id == undefined) {
    return null
  }

  if (!logoutUser(session)) {
    return null
  }
  return reloadSession(session)
}

export async function createDefaultUser(name: string, password: string) {
  const user = await findtUserByEmail(name)
  if (!user || user._id == undefined) {
    await insertUser({name: name, email: name, password: password})
    
  }
}