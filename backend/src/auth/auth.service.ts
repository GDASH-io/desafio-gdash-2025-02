import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';
import { LoginDto } from './dto/login.dto';
import { UserPublic } from '../users/interfaces/user-public.interface';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly jwtService: JwtService
	) {}

	private toPublic(user: User): UserPublic {
		return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
	}

	async validateUser(email: string, password: string): Promise<User | null> {
		const user = await this.userModel.findOne({ email }).select('+passwordHash');
		if (!user) return null;
		const match = await bcrypt.compare(password, user.passwordHash);
		return match ? user : null;
	}

	async login(dto: LoginDto): Promise<{ user: UserPublic; accessToken: string; expiresIn: number }> {
		const user = await this.validateUser(dto.email, dto.password);
		if (!user) throw new UnauthorizedException('Credenciais inválidas');
		const payload = { sub: user.id, email: user.email, role: user.role };
		const accessToken = await this.jwtService.signAsync(payload);
		// 8h em segundos
		const expiresIn = 8 * 60 * 60;
		return { user: this.toPublic(user), accessToken, expiresIn };
	}
}
