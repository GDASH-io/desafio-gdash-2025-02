import { Body, Controller, Get, Headers, Post, Request, UnauthorizedException } from '@nestjs/common';
import { CreateUsersService } from './services/create-users.service';
import type { IUsersEntity } from './interfaces/IUsersEntity';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
    constructor(
        private createUserService: CreateUsersService,
        private jwtService: JwtService,
    ){}

    @Post('')
    async postUser(@Body() user: IUsersEntity): Promise<IUsersEntity>{
        return this.createUserService.saveUser(user);
    }

    @Get('/latest')
    async getUser(): Promise<IUsersEntity | null>{
        return this.createUserService.findLatest();
    }

    @Post('/login')
    async postLogin(@Body("email") email: string, @Body("password") password: string){
        return this.createUserService.login(email, password);
    }

    @Get('/profile')
    async getProfile(@Headers('authorization') auth: string){
        if (!auth) throw new UnauthorizedException('Ce nao mandou o token po');

        const token = auth.replace('Bearer ', '');

        const payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
        });

        return this.createUserService.findById(payload.sub);
    }

    @Post('/profile/edit')    
    async editProfile(@Headers('authorization') auth: string, @Body() body: {name: string, email: string, password: string}){
        if (!auth) 
            throw new UnauthorizedException('Ce nao mandou o token po');

        const token = auth.replace('Bearer ', '');

        const payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
        });

        return await this.createUserService.editUser(payload.sub, body.name, body.email, body.password);
    }

    @Post('/profile/edit/password')
    async editPassword(@Headers('authorization') auth: string, @Body() body: {password: string, newPassword: string}){
        if (!auth) 
            throw new UnauthorizedException('Ce nao mandou o token po');

        const token = auth.replace('Bearer ', '');

        const payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
        });

        return await this.createUserService.editPassword(payload.sub, body.password, body.newPassword);
    }
}
