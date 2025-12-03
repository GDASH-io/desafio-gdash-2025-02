import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
