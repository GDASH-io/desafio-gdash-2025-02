import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { ERROR_MESSAGES } from '../../../../shared/constants/errors';

@Injectable()
export class DeleteUserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(ERROR_MESSAGES.USERS.NOT_FOUND);
    }
  }
}
