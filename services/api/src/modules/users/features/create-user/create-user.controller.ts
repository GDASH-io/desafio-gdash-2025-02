import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.USERS.BASE)
@UseGuards(JwtAuthGuard)
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.createUserService.create(createUserDto);
  }
}
