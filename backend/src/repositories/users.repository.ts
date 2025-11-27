import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { CreateUserDto, UpdateUserDto } from "../../dto/user.dto";


@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  findAll() {
    return this.userModel.find().lean();
  }

  findById(id: string) {
    return this.userModel.findById(id).lean();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean();
  }

  create(data: CreateUserDto) {
    return this.userModel.create(data);
  }

  async update(id: string, data: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id).lean();
  }
}
