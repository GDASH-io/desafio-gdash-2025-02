import { model, models, Schema } from "mongoose"

export interface ISession {
  _id?: string
  userId?: string
  userAgent: string
}

const SessionSchema = new Schema<ISession>({
  userId: {type: String},
  userAgent: {type: String, required: true}
})

const Session = models.Session || model("Session", SessionSchema)

export async function insertSession(data: ISession): Promise<ISession> {
  try {
    const newRecord = await Session.create(data);
    return newRecord;
  } catch (error) {
    throw new Error(`Insert session error: ${error}`);
  }
}

export async function findSession(id: string): Promise<ISession|null> {
  try {
    const record = await Session.findById(id);
    return record;
  } catch (error) {
    throw new Error(`find session error: ${error}`);
  }
}

export async function updateSession(data: ISession): Promise<ISession|null> {
  try {
    const record = await Session.findOneAndUpdate({id: data._id}, data, {new: true})
    return record
  }catch (err) {
    throw new Error(`update session error: ${err}`);
  }
}

export async function updateSessionSetUserId(sessionId: string, userId: string): Promise<ISession|null> {
  try {
    const record = await Session.findByIdAndUpdate(sessionId, { userId: userId }, {new: true})
    return record
  }catch (err) {
    throw new Error(`update session error: ${err}`);
  }
}

export async function updateSessionUnsetUserId(sessionId: string): Promise<ISession|null> {
  try {
    const record = await Session.findByIdAndUpdate(sessionId, { $unset: { userId: 1 } }, {new: true})
    return record
  }catch (err) {
    throw new Error(`update session error: ${err}`);
  }
}