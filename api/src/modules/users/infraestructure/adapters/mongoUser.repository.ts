import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { mongoDBConstants } from 'src/shared/constants';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserRepositoryPort } from '../../ports/user.repository.port';
import { UserDocument } from '../schema/user.schema';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @Inject(mongoDBConstants.models.USER_MODEL)
    private readonly userModel: Model<UserDocument>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(createUserDto);
  }
  findAll(): Promise<UserDocument[]> {
    return this.userModel.find({});
  }
  findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }
  update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }
  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }
}
