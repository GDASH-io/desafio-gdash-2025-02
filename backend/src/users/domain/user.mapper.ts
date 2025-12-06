import { UserEntity } from './user.entity';

export class UserMapper {
  static toResponse(user: UserEntity) {
    const { password, ...response } = user;
    return response;
  }
}
