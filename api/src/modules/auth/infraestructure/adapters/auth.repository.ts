import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from 'src/modules/users/infraestructure/schema/user.schema';
import { mongoDBConstants } from 'src/shared/constants';
import { UserRole } from 'src/types';
import { AuthRepositoryPort } from '../../ports/auth.repository.port';

@Injectable()
export class AuthRepository implements AuthRepositoryPort {
  constructor(
    @Inject(mongoDBConstants.models.USER_MODEL)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const userExists = await this.userModel.findOne({ email });
    return userExists;
  }
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    const user = await this.userModel.create({
      ...data,
      role: data.role || UserRole.USER,
    });

    return user;
  }
}
