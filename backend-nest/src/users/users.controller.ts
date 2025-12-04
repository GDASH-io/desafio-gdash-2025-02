import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()
  async getAll() {
    return this.svc.findAll();
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateUser(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.svc.deleteUser(id);
  }
}
