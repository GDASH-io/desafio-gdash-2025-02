import { model, models, Schema } from "mongoose"

export interface IUser {
  _id?: string
  name: string
  email: string
  password: string
}

const UserSchema = new Schema<IUser>({
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true}
})

const User = models.User || model("User", UserSchema)

export async function insertUser(data: IUser): Promise<IUser> {
  try {
    const newRecord = await User.create(data);
    return newRecord;
  } catch (error) {
    throw new Error(`Insert user error: ${error}`);
  }
}

export async function upsertUser(data: IUser): Promise<IUser> {
  try {
    const newRecord = await User.findOneAndUpdate(data, {upsert: true, new: true});
    return newRecord;
  } catch (error) {
    throw new Error(`UpsertUser user error: ${error}`);
  }
}

export async function findtUser(id: string): Promise<IUser|null> {
  try {
    const record = await User.findById(id);
    return record;
  } catch (error) {
    throw new Error(`find user by email error: ${error}`);
  }
}

export async function findtUserByEmail(email: string): Promise<IUser|null> {
  try {
    const record = await User.findOne({email: email});
    return record;
  } catch (error) {
    throw new Error(`find user by email error: ${error}`);
  }
}