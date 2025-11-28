import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { PaginatedResponseDto } from '../../utils/paginated-response.dto';

export class PaginatedUsersResponseDto extends PaginatedResponseDto<UserResponseDto> {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
    isArray: true,
  })
  declare data: UserResponseDto[];
}
