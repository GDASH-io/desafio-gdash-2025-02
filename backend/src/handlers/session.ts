import { findSession, insertSession } from '@/db/models/session';
import { findtUser } from '@/db/models/user';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

interface SessionPayload {
  sessionId: string
}

export interface UserInternal {
  id: string
  name: string
  email: string
}

export interface SessionInternal {
  token: string,
  id: string
  user?: UserInternal
}

async function createToken(payload: SessionPayload) {
  const alg = 'HS256';

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  return token;
}

async function decryptToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload, protectedHeader } = await jwtVerify<SessionPayload>(token, secret);
    return payload
  } catch (err) {
    console.warn(`invalid: ${err}`)
    return null
  }
}

export async function createSession(userAgent: string): Promise<SessionInternal|null> {
  const newSession = await insertSession({userAgent: userAgent})
  if (!newSession._id) {
    return null
  }

  const token = await createToken({sessionId: newSession._id.toString()})

  return {token: token, id: newSession._id.toString()}
}

export async function loadSession(token: string, userAgent: string): Promise<SessionInternal|null> {
  const payload = await decryptToken(token)
  if (!payload) {
    return createSession(userAgent)
  }

  const dbSession = await findSession(payload.sessionId)
  if (!dbSession) {
    return createSession(userAgent)
  }

  /*
  if (dbSession.userAgent != userAgent) {
    return createSession(userAgent)
  }
  */

  let userInternal: UserInternal|undefined
  if (dbSession.userId) {
    const dbUser = await findtUser(dbSession.userId)
    if (dbUser) {
      userInternal = {id: dbSession.userId, name: dbUser.name, email: dbUser.email}
    }
  }

  return {id: payload.sessionId, token: token, user: userInternal}
}

export async function reloadSession(oldSession: SessionInternal): Promise<SessionInternal|null> {
  const dbSession = await findSession(oldSession.id)
  if (!dbSession) {
    return null
  }

  let userInternal: UserInternal|undefined
  if (dbSession.userId) {
    const dbUser = await findtUser(dbSession.userId)
    if (dbUser) {
      userInternal = {id: dbSession.userId, name: dbUser.name, email: dbUser.email}
    }
  }

  return {id: oldSession.id, token: oldSession.token, user: userInternal}
}

export async function HandleSession(request: NextRequest): Promise<SessionInternal|null> {
  const token = request.headers.get("Authorization")?.split("Bearer ")[0]
  const agent = request.headers.get("User-Agent")

  if (!agent) {
    return null
  }

  if (!token) {
    return createSession(agent)
  }
  return loadSession(token, agent)
}