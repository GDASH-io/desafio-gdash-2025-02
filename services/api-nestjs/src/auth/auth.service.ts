import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import { TokenLoginDto } from 'src/DTO/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import e from 'express';
dotenv.config();

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) { }

    async createTokens(usuario: TokenLoginDto) {
        const acessjwtSecret = process.env.ACCESS_JWT_SECRET;
        const refreshJwtSecret = process.env.REFRESH_JWT_SECRET;
        const payload = { sub: usuario.id.toString(), email: usuario.email };
        const accessToken = this.jwtService.sign(payload, { secret: acessjwtSecret, expiresIn: '10m' });
        const refreshToken = this.jwtService.sign(payload, { secret: refreshJwtSecret, expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    async login(loginDto: { email: string; senha: string }) {
        const usuarioDB = await this.userModel.findOne({ email: loginDto.email });
        const { senha } = loginDto;
        if (!usuarioDB) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        const senhaValida = await bcrypt.compare(senha, usuarioDB.senha);
        if (!senhaValida) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        const usuario: TokenLoginDto = {
            id: usuarioDB._id.toString(),
            nome: usuarioDB.nome,
            email: usuarioDB.email
        };
        const tokens = await this.createTokens(usuario);
        return {
            user: {
                id: usuarioDB._id.toString(),
                nome: usuarioDB.nome,
                email: usuarioDB.email,
            },
            tokens,
        };
    }
}