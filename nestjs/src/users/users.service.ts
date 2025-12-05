import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data) {
    data.password = await bcrypt.hash(data.password, 10);
    return this.userModel.create(data);
  }

  async findAll() {
    return this.userModel.find();
  }
}
