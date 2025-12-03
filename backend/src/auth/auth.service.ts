import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        console.log(`Validating user: ${email}`);
        const user = await this.usersService.findOne(email);
        if (!user) {
            console.log('User not found');
            return null;
        }
        console.log('User found, checking password...');
        const isMatch = await bcrypt.compare(pass, user.password);
        console.log(`Password match: ${isMatch}`);
        if (isMatch) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                email: user.email,
                name: user.name
            }
        };
    }
}
