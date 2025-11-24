import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UpdateUserService } from './update-user.service';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.USERS.BASE)
@UseGuards(JwtAuthGuard)
export class UpdateUserController {
  constructor(private readonly updateUserService: UpdateUserService) {}

  @Patch(API_ROUTES.USERS.BY_ID)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserService.update(id, updateUserDto);
  }
}
