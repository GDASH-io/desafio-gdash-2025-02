import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GetMe } from 'src/common/decorators/GetMe';
import { Roles } from 'src/common/decorators/Roles';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { UserRole } from 'src/types';
import { type JwtPayload } from '../../types/auth.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './infraestructure/schema/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.mapUser(user);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return { data: this.mapUser(users) };
  }

  @Get('me')
  async findMe(@GetMe() user: JwtPayload) {
    const currentUser = await this.usersService.findOne(user.id);
    return { data: this.mapUser(currentUser) };
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return { data: this.mapUser(user) };
  }

  @Put('me')
  async updateMe(
    @GetMe() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return { data: this.mapUser(updatedUser) };
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return { data: this.mapUser(updatedUser) };
  }

  @Delete('me')
  async removeMe(@GetMe() user: JwtPayload) {
    await this.usersService.remove(user.id);
    return { message: 'User removed successfully' };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User removed successfully' };
  }

  private mapUser(user: UserDocument[] | UserDocument) {
    if (Array.isArray(user)) {
      return user.map((u) => {
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      });
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
