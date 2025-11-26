import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.usersService.findByEmail(body.email);
    if (user && user.senha === body.senha) {
      // Login OK
      return { status: 'ok', nome: user.nome };
    } else {
      throw new HttpException('Credenciais Inválidas', HttpStatus.UNAUTHORIZED);
    }
  }
}
