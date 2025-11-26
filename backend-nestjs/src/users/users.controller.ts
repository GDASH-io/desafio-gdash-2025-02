import { Controller, Get, Post, Body, Param, Delete, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './users.service';

class LoginDto {
  @ApiProperty({ example: 'admin@gdash.io' }) email: string;
  @ApiProperty({ example: '123456' }) password: string;
}

class CreateUserDto {
  @ApiProperty({ example: 'User Name' }) name: string;
  @ApiProperty({ example: 'user@gdash.io' }) email: string;
  @ApiProperty({ example: 'password123' }) password: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.login(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}