import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

export class LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    async me() {
        return {
            id: '1',
            name: 'Admin User',
            email: 'admin@weather.com',
            role: 'admin',
        };
    }
}
