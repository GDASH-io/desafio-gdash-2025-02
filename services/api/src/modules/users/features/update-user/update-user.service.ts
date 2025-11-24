import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../../schemas/user.schema';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { ERROR_MESSAGES } from '../../../../shared/constants/errors';

@Injectable()
export class UpdateUserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USERS.NOT_FOUND);
    }

    return user;
  }
}
