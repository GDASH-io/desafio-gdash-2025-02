import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt?: Date;
}
