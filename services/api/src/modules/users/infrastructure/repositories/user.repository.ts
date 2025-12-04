import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { Model } from "mongoose";
import { CreateUserDto, UpdateUserDto } from "../../application/dto/user.dto";

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const user = new this.userModel(createUserDto);
        return user.save()
    }

    async findAll(filters: {
        isActive?: boolean;
        skip?: number;
        limit?: number;
    }): Promise<UserDocument[]> {
        const query = this.userModel.find();

        if (filters.isActive !== undefined) {
            query.where('isActive').equals(filters.isActive);
        }

        if (filters.skip) {
            query.skip(filters.skip);
        }

        if (filters.limit) {
            query.limit(filters.limit);
        }

        return query.sort({ createdAt: -1 }).exec()
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email: email.toLowerCase() }).exec();
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
        return this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .exec();
    }

    async delete(id: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    async count(filters?: { isActive?: boolean }): Promise<number> {
        const query = this.userModel.countDocuments();

        if (filters?.isActive !== undefined) {
            query.where('isActive').equals(filters.isActive);
        }

        return query.exec();
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
    }
}