import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async findAll(query: { page?: number; limit?: number }): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).select('-password').exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true }).select('-password').exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

