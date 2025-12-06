import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  FindManyParams,
  FindManyResult,
  UserRepository,
} from "@/domain/application/repositories/user-repository";
import { User } from "@/domain/enterprise/entities/user";
import { UserDocument, UserSchema } from "../schemas/user.schema";
import { UserMapper } from "../mappers/user-mapper";

@Injectable()
export class MongoDBUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private userModel: Model<UserDocument>
  ) {}

  async create(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    await this.userModel.create(data);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findMany(params: FindManyParams): Promise<FindManyResult> {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const query = search ? { $text: { $search: search } } : {};

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return {
      users: users.map(UserMapper.toDomain),
      total,
    };
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.userModel.findByIdAndUpdate(user.id.toString(), data).exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
