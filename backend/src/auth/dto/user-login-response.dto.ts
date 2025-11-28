import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/enums/role.enum';

export class UserLoginResponseDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  role: Role;
}
