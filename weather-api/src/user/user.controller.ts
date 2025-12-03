import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service';

import { ActiveUserId } from 'decorators/ActiveUserId';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  me(@ActiveUserId() userId: string) {
    return this.userService.getUserById(userId);
  }

  @Patch('/update')
  update(@ActiveUserId() userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserById(userId, updateUserDto);
  }

  @Delete('/delete')
  delete(@ActiveUserId() userId: string) {
    return this.userService.deleteUserById(userId);
  }
}
