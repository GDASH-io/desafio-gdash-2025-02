import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './schemas/user.schema';

interface CreateUserDto {
	username: string;
	password: string;
	role?: 'admin' | 'user';
}

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);

	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		private readonly jwtService: JwtService,
	) {
		this.createDefaultUser().catch(err => this.logger.error(err));
	}

	async createDefaultUser() {
		try {
			const defaultUsername = 'admin';
			const existing = await this.userModel.findOne({ username: defaultUsername }).exec();
			if (!existing) {
				const password = 'password123';
				const passwordHash = await bcrypt.hash(password, 10);
				await this.userModel.create({ username: defaultUsername, passwordHash, role: 'admin' });
				this.logger.debug('Usuário admin padrão criado: admin/password123');
			}
		} catch (err) {
			this.logger.error('Erro ao criar usuário padrão', err);
		}
	}

	async validateUser(username: string, pass: string) {
		const user = await this.userModel.findOne({ username }).exec();
		if (user && await bcrypt.compare(pass, user.passwordHash)) {
			const u = user.toObject();
			// Remove hash before returning
			// @ts-ignore
			delete u.passwordHash;
			return u;
		}
		return null;
	}

	async login(user: any) {
		const payload = { username: user.username, sub: user._id, role: user.role };
		return { access_token: this.jwtService.sign(payload) };
	}

	async create(dto: CreateUserDto) {
		const passwordHash = await bcrypt.hash(dto.password, 10);
		const created = new this.userModel({ username: dto.username, passwordHash, role: dto.role || 'user' });
		return created.save();
	}

	async findAll() {
		return this.userModel.find().select('-passwordHash').exec();
	}

	async update(id: string, updateData: Partial<CreateUserDto>) {
		const data: any = { ...updateData };
		if (updateData.password) {
			data.passwordHash = await bcrypt.hash(updateData.password, 10);
			delete data.password;
		}
		return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}