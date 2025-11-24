import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { DeleteUserService } from './delete-user.service';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.USERS.BASE)
@UseGuards(JwtAuthGuard)
export class DeleteUserController {
  constructor(private readonly deleteUserService: DeleteUserService) {}

  @Delete(API_ROUTES.USERS.BY_ID)
  remove(@Param('id') id: string) {
    return this.deleteUserService.remove(id);
  }
}
