import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from 'database/prisma.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const emailIsExist = await this.prisma.user.findUnique({
      where: {
        email: signUpDto.email,
      },
    });

    if (emailIsExist) {
      throw new ConflictException('This email is already in use');
    }
    const hashedPassword = await hash(signUpDto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: signUpDto.email,
        name: signUpDto.name,
        password: hashedPassword,
      },
    });
    const payload = { sub: user.id };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: signInDto.email,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Credentials Invalid');
    }
    const isPasswordValid = await compare(
      signInDto.password,
      String(user.password),
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials Invalid');
    }
    const payload = { sub: user.id };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
    };
  }
}
