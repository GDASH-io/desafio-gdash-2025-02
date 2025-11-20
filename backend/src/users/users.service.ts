import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { PaginatedResponseDto } from '../utils/paginated-response.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(userData: User): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findUsersPaginated(
    page: number = 1,
    totalItems: number = 10,
  ): Promise<PaginatedResponseDto<UserDocument>> {
    const skip = (page - 1) * totalItems;
    const [data, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(totalItems).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / totalItems);

    return {
      data,
      page,
      totalItems,
      totalPages,
      total,
    };
  }

  async updateUser(
    id: string,
    userData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, userData, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
