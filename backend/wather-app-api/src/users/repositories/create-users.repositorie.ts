import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users, UsersDocument } from "../schema/users.schema";
import { Model } from "mongoose";
import { IUsersEntity } from "../interfaces/IUsersEntity";

@Injectable()
export class CreateUsersRepository{
    constructor(
        @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
    ){}

    async saveUser(user: IUsersEntity): Promise<IUsersEntity>{
        const createUser = new this.usersModel(user);
        await createUser.save();
        return createUser.toObject();
    }

    async findLatest(): Promise<IUsersEntity | null>{
        return await this.usersModel.findOne().sort({ _id: -1 }).exec();
    }

    async login(email: string): Promise<IUsersEntity | null>{
        return this.usersModel.findOne({ email }).exec();
    }

    async findById(_id: string): Promise<IUsersEntity | null>{
        return this.usersModel.findOne({ _id }).exec();
    }

    async ediUser(_id: string, name: string, email: string): Promise<IUsersEntity | null>{
        return await this.usersModel.findByIdAndUpdate(_id, {name, email}, {new: true}).exec();
    }

    async editPassword(_id: string, password: string): Promise<IUsersEntity | null>{
        return await this.usersModel.findByIdAndUpdate(_id, {password}, {new: true}).exec();
    }
}