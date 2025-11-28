import { ApiProperty } from '@nestjs/swagger';
import { UserLoginResponseDto } from './user-login-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({ description: 'User information', type: UserLoginResponseDto })
  user: UserLoginResponseDto;
}
