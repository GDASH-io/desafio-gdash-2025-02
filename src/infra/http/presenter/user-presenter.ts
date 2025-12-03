import { User } from '@/domain/enterprise/entities/user';
export class UserPresenter {
  static toHTTP(user: User) {
    return {
      user: user.name,
      userName: user.userName,
      email: user.email,
    };
  }
}
