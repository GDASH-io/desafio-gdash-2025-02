import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EncryptPort } from '../../ports/encrypt.ports';

@Injectable()
export class EncryptAdapter implements EncryptPort {
  private readonly token: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.token = this.config.getOrThrow<string>('JWT_SECRET');
  }

  async createAuthToken<T extends object>(payload: T): Promise<string> {
    const token = await this.jwtService.signAsync<T>(payload, {
      secret: this.token,
    });
    return token;
  }
  verifyAuthToken<T extends object>(token: string): T {
    const payload = this.jwtService.verify<T>(token, {
      secret: this.token,
    });
    return payload;
  }
  async encrypt(password: string): Promise<string> {
    const saltOrRounds = await bcrypt.genSalt();
    return bcrypt.hash(password, saltOrRounds);
  }
  async verify(encryptedPassword: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, encryptedPassword);
  }
}
