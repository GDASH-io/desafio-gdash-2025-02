import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';

interface LoginDto {
	username: string;
	password: string;
}

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService) {}

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		const user = await this.usersService.validateUser(loginDto.username, loginDto.password);
		if (!user) {
			throw new HttpException('Credenciais Inválidas', HttpStatus.UNAUTHORIZED);
		}
		return this.usersService.login(user);
	}
}
