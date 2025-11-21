import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRoleEnum } from '@repo/shared'
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({ enum: UserRoleEnum, example: UserRoleEnum.USER })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum
}
