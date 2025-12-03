import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: any): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findOne(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async remove(id: string): Promise<any> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    async onModuleInit() {
        const adminEmail = 'admin@example.com';
        const adminExists = await this.findOne(adminEmail);
        if (!adminExists) {
            await this.create({
                email: adminEmail,
                password: 'adminpassword',
                name: 'Admin User',
            });
            console.log('Admin user seeded');
        }
    }
}
