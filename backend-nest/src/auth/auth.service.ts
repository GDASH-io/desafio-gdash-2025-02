import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Credenciais inválidas');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Senha inválida');

        const payload = { sub: user._id, email: user.email };

        return {
            access_token: await this.jwt.signAsync(payload),
            user,
        };
    }
    async register(dto: RegisterDto) {
        const exists = await this.usersService.findByEmail(dto.email);
        if (exists) throw new BadRequestException('E-mail já está em uso');

        const hashed = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.create({
            email: dto.email,
            password: hashed,
            name: dto.name,
        });

        return {
            message: 'Usuário criado com sucesso',
            user: { id: user._id, email: user.email, name: user.name },
        };
    }
}
