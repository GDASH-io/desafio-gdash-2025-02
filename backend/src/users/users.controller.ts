import {
  Body,
  Controller,
  Delete,
  Get,
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
  getProfile(@Request() req) {
    return req.user;
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
}
