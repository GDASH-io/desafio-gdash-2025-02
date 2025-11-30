import { Inject, Injectable } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { EncryptPort } from './ports/encrypt.ports';

@Injectable()
export class EncryptService {
  constructor(
    @Inject(commonConstants.ports.ENCRYPT)
    private readonly encrypt: EncryptPort,
  ) {}

  async encryptPassword(password: string): Promise<string> {
    return this.encrypt.encrypt(password);
  }

  async verifyPassword(
    encryptedPassword: string,
    password: string,
  ): Promise<boolean> {
    return this.encrypt.verify(encryptedPassword, password);
  }

  async generateNewToken<T extends object>(payload: T): Promise<string> {
    return this.encrypt.createAuthToken(payload);
  }

  verifyAuthToken<T extends object>(token: string): T {
    return this.encrypt.verifyAuthToken<T>(token);
  }
}
