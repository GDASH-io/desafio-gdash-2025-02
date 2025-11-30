import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import { ResponseUserDto } from 'src/DTO/user.dto';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) { }

    async createTokens(usuario: ResponseUserDto) {
        const payload = { sub: usuario.id.toString(), email: usuario.email };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
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
        const tokens = await this.createTokens(usuarioDB);
        return {
            id: usuarioDB._id.toString(),
            nome: usuarioDB.nome,
            tokens,
        };
    }
}