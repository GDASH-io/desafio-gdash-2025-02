import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body.email, body.password, body.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const { password, ...result } = user.toObject();
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  update(@Request() req, @Body() body: any) {
    return this.usersService.update(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile')
  remove(@Request() req) {
    return this.usersService.remove(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
