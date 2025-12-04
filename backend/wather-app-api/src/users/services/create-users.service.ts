import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateUsersRepository } from "../repositories/create-users.repositorie";
import { IUsersEntity } from "../interfaces/IUsersEntity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUsersService{
    constructor(
        private readonly createUserRepository : CreateUsersRepository,
        private readonly jwtService: JwtService,
    ){}

    async saveUser(user: IUsersEntity): Promise<IUsersEntity>{
        const hashed = await bcrypt.hash(user.password, 10);
        user.password = hashed;
        return this.createUserRepository.saveUser(user);
    }

    async findLatest(): Promise<IUsersEntity | null>{
        return this.createUserRepository.findLatest();
    }

    async login(email: string, password: string){
        const user = await this.createUserRepository.login(email);

        if(!user)
            throw new UnauthorizedException("O usuário nao existe!")

        const passwordMatches = await bcrypt.compare(password, user.password);
        
        if(!passwordMatches)
            throw new UnauthorizedException("Senha incorreta");

        const payload = {
            sub: user._id,
            email: user.email
        }

        const token = await this.jwtService.signAsync(payload);

        return{
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };
    }

    async validatePassword(_id: string, password: string){
        const user = await this.createUserRepository.findById(_id);
        if(!user)
            throw new UnauthorizedException("O usuário nao existe!")

        const passwordMatches = await bcrypt.compare(password, user.password);
        return passwordMatches;
    }

    async findById(_id: string): Promise<IUsersEntity | null>{
        return this.createUserRepository.findById(_id);
    }

    async editPassword(_id: string, password: string, newPassword: string): Promise<IUsersEntity | null>{
        const validate = await this.validatePassword(_id, password);

        if(!validate)
            throw new UnauthorizedException("essa senha ai ta meio suspeita hein");

        else{
            const hashed = await bcrypt.hash(newPassword, 10);
            newPassword = hashed;

            return await this.createUserRepository.editPassword(_id, newPassword);
        }
    }

    async editUser(_id: string, name: string, email: string, password: string): Promise<IUsersEntity | null>{
        const validate = await this.validatePassword(_id, password);

        if(!validate)
            throw new UnauthorizedException("essa senha ai ta meio suspeita hein");

        else
            return await this.createUserRepository.ediUser(_id, name, email);
    }
}