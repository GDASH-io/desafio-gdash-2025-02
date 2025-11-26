import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/usecases/users/create-user.use-case';
import { GetUsersUseCase } from '../../application/usecases/users/get-users.use-case';
import { GetUserUseCase } from '../../application/usecases/users/get-user.use-case';
import { UpdateUserUseCase } from '../../application/usecases/users/update-user.use-case';
import { DeleteUserUseCase } from '../../application/usecases/users/delete-user.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @Roles('admin')
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.getUsersUseCase.execute(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getUserUseCase.execute(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}

