import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async createDefaultUser(): Promise<void> {
    const defaultEmail = this.configService.get<string>('DEFAULT_USER_EMAIL');
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD');
    
    if (!defaultEmail || !defaultPassword) {
      console.log('Default user credentials not configured');
      return;
    }

    const existingUser = await this.userModel.findOne({ email: defaultEmail });
    if (existingUser) {
      console.log('Default user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const defaultUser = new this.userModel({
      name: 'Administrator',
      email: defaultEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await defaultUser.save();
    console.log(`Default user created: ${defaultEmail}`);
  }
}