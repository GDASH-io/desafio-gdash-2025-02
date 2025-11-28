import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<UserDocument | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        if (!user.password) {
            return null;
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return null;
        }
        return user;
    }

    async login(user: UserDocument) {
        const payload = { email: user.email, sub: user._id.toString() };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}