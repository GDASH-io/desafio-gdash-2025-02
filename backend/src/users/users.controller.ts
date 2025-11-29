import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto'; 

@UseGuards(JwtAuthGuard) 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
 @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto); 
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}