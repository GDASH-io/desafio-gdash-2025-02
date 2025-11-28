import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserPublic } from './interfaces/user-public.interface';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

    private toPublic(doc: User): UserPublic {
        return {
            id: doc._id.toString(),
            email: doc.email,
            role: doc.role as 'admin' | 'user',
            createdAt: (doc as any).createdAt,
        };
    }

    async create(dto: CreateUserDto): Promise<UserPublic> {
		const exists = await this.userModel.exists({ email: dto.email.toLowerCase() });
		if (exists) throw new ConflictException('Email já cadastrado');

		const hash = await bcrypt.hash(dto.password, 10);
		const created = await this.userModel.create({
			email: dto.email.toLowerCase(),
			passwordHash: hash,
			role: dto.role || 'user',
		});
        return this.toPublic(created);
	}

    async findAll(): Promise<UserPublic[]> {
		const docs = await this.userModel.find().sort({ createdAt: -1 }).exec();
        return docs.map(d => this.toPublic(d));
	}

    async findById(id:string): Promise<UserPublic> {
        const user = await this.userModel.findById(id).exec();
        if(!user) throw new NotFoundException('Usuário não encontrado');
        return this.toPublic(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        return user;
    }

    async update(id: string, data: UpdateUserDto): Promise<UserPublic> {
        const update: Record<string, any> = {};

        if (data.email) {
            const email = data.email.toLowerCase();
            const exists = await this.userModel.exists({ email, _id: { $ne: id } });
            if (exists) throw new ConflictException('Email já cadastrado');
            update.email = email;
        }

        if (data.password) {
            update.passwordHash = await bcrypt.hash(data.password, 10);
        }

        if (data.role) {
            update.role = data.role;
        }

        const doc = await this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
        if (!doc) throw new NotFoundException('Usuário não encontrado');
        return this.toPublic(doc);
    }

    async remove(id: string) {
        const res = await this.userModel.findByIdAndDelete(id).exec();
        if (!res) throw new NotFoundException('Usuário não encontrado');
        return { deleted: true };
    }
}
