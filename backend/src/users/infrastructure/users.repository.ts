import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { IUsersRepository } from '../domain/users.repository.interface';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private toEntity(doc: UserDocument): UserEntity {
    return new UserEntity(doc.email, doc.password, doc._id.toString(), doc.createdAt);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = new this.userModel({
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
    });
    const saved = await createdUser.save();
    return this.toEntity(saved);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.toEntity(user) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => this.toEntity(user));
  }
}
