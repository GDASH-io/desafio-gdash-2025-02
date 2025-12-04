import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto & { latitude?: number; longitude?: number }) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new BadRequestException('email already registered');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hash,
    });
    const userId = user._id.toString()
    if (dto.latitude && dto.longitude) {
      try {
        await axios.post('http://worker:8080/location', {
          userId,
          latitude: dto.latitude,
          longitude: dto.longitude,
        });

        console.log('[OK] Location sent to Go Worker:', { userId });
      } catch (err) {
        console.error('[ERROR] Failed to send location to Go Worker');
        console.error(err.response?.data || err.message);
      }
    }

    return {
      message: 'user registered',
      data: { ...user.toObject(), _id: userId },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('invalid credentials');

    const payload = { sub: user._id.toString(), email: user.email };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async sendLocationToGo(userId: string, latitude: number, longitude: number) {
    try {
      await axios.post('http://worker:8080/location', {
        userId,
        latitude,
        longitude,
      });

      console.log('[OK] Manual location sent:', { userId });
    } catch (err) {
      console.error('[ERROR] Failed to send manual location');
      console.error(err.response?.data || err.message);
    }
  }

  async getUserByEmail(email: string) {
    return this.usersService.findByEmail(email);
  }
}
