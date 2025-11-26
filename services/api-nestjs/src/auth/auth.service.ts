import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    async login(loginDto: { email: string; password: string }) {
        // Mock authentication - aceita qualquer email com password123
        if (loginDto.password !== 'password123') {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: '1',
                name: 'Admin User',
                email: loginDto.email,
                role: 'admin',
                createdAt: new Date().toISOString(),
            },
        };
    }
}
