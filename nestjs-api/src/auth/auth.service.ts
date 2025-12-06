import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Return user data without password - Mongoose documents have _id property
      const userDoc = user as any;
      return {
        _id: userDoc._id,
        email: user.email,
        roles: user.roles || 'user',
      };
    }
    return null;
  }

  async login(user: any) {
    // The user comes from validateUser which already has the correct structure
    const userId = user._id?.toString();
    const userEmail = user.email;
    const userRoles = user.roles || 'user';
    
    const payload = { email: userEmail, sub: userId, roles: userRoles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: any) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }
}
