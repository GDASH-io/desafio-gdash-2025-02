import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FindUsersService } from './find-users.service';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.USERS.BASE)
@UseGuards(JwtAuthGuard)
export class FindUsersController {
  constructor(private readonly findUsersService: FindUsersService) {}

  @Get()
  findAll() {
    return this.findUsersService.findAll();
  }

  @Get(API_ROUTES.USERS.BY_ID)
  findOne(@Param('id') id: string) {
    return this.findUsersService.findOne(id);
  }
}
