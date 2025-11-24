import { Injectable } from '@nestjs/common';
import { FindUsersService } from '../../../users/features/find-users/find-users.service';

@Injectable()
export class ValidateTokenService {
  constructor(private findUsersService: FindUsersService) {}

  async validateToken(payload: { email: string; sub: string; name: string }) {
    return this.findUsersService.findByEmail(payload.email);
  }
}
