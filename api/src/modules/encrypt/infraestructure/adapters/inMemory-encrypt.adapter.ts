import { Injectable } from '@nestjs/common';
import { EncryptPort } from '../../ports/encrypt.ports';

@Injectable()
export class InMemoryEncryptAdapter implements EncryptPort {
  private mockEncryptedPassword: string = 'mock-hashed-password';
  private mockVerifyResult: boolean = true;
  private mockToken: string = 'mock-jwt-token';
  private mockTokenPayload: object | null = null;

  private shouldFailEncrypt: boolean = false;
  private shouldFailVerify: boolean = false;
  private shouldFailCreateToken: boolean = false;
  private shouldFailVerifyToken: boolean = false;

  private encryptCallCount: number = 0;
  private verifyCallCount: number = 0;
  private createTokenCallCount: number = 0;
  private verifyTokenCallCount: number = 0;

  private lastEncryptPassword: string | null = null;
  private lastVerifyParams: {
    encryptedPassword: string;
    password: string;
  } | null = null;
  private lastCreateTokenPayload: object | null = null;
  private lastVerifyTokenToken: string | null = null;

  async encrypt(password: string): Promise<string> {
    this.encryptCallCount++;
    this.lastEncryptPassword = password;

    if (this.shouldFailEncrypt) {
      throw new Error('InMemory Encrypt failed');
    }

    return Promise.resolve(this.mockEncryptedPassword);
  }

  async verify(encryptedPassword: string, password: string): Promise<boolean> {
    this.verifyCallCount++;
    this.lastVerifyParams = { encryptedPassword, password };

    if (this.shouldFailVerify) {
      throw new Error('InMemory Verify failed');
    }

    return Promise.resolve(this.mockVerifyResult);
  }

  async createAuthToken<T extends object>(payload: T): Promise<string> {
    this.createTokenCallCount++;
    this.lastCreateTokenPayload = payload;

    if (this.shouldFailCreateToken) {
      throw new Error('InMemory CreateAuthToken failed');
    }

    return Promise.resolve(this.mockToken);
  }

  verifyAuthToken<T extends object>(token: string): T {
    this.verifyTokenCallCount++;
    this.lastVerifyTokenToken = token;

    if (this.shouldFailVerifyToken) {
      throw new Error('InMemory VerifyAuthToken failed');
    }

    return (this.mockTokenPayload || {}) as T;
  }

  setMockEncryptedPassword(password: string): void {
    this.mockEncryptedPassword = password;
  }

  setMockVerifyResult(result: boolean): void {
    this.mockVerifyResult = result;
  }

  setMockToken(token: string): void {
    this.mockToken = token;
  }

  setMockTokenPayload<T extends object>(payload: T): void {
    this.mockTokenPayload = payload;
  }

  setShouldFailEncrypt(shouldFail: boolean): void {
    this.shouldFailEncrypt = shouldFail;
  }

  setShouldFailVerify(shouldFail: boolean): void {
    this.shouldFailVerify = shouldFail;
  }

  setShouldFailCreateToken(shouldFail: boolean): void {
    this.shouldFailCreateToken = shouldFail;
  }

  setShouldFailVerifyToken(shouldFail: boolean): void {
    this.shouldFailVerifyToken = shouldFail;
  }

  getEncryptCallCount(): number {
    return this.encryptCallCount;
  }

  getVerifyCallCount(): number {
    return this.verifyCallCount;
  }

  getCreateTokenCallCount(): number {
    return this.createTokenCallCount;
  }

  getVerifyTokenCallCount(): number {
    return this.verifyTokenCallCount;
  }

  getLastEncryptPassword(): string | null {
    return this.lastEncryptPassword;
  }

  getLastVerifyParams(): {
    encryptedPassword: string;
    password: string;
  } | null {
    return this.lastVerifyParams;
  }

  getLastCreateTokenPayload(): object | null {
    return this.lastCreateTokenPayload;
  }

  getLastVerifyTokenToken(): string | null {
    return this.lastVerifyTokenToken;
  }

  reset(): void {
    this.mockEncryptedPassword = 'mock-hashed-password';
    this.mockVerifyResult = true;
    this.mockToken = 'mock-jwt-token';
    this.mockTokenPayload = null;

    this.shouldFailEncrypt = false;
    this.shouldFailVerify = false;
    this.shouldFailCreateToken = false;
    this.shouldFailVerifyToken = false;

    this.encryptCallCount = 0;
    this.verifyCallCount = 0;
    this.createTokenCallCount = 0;
    this.verifyTokenCallCount = 0;

    this.lastEncryptPassword = null;
    this.lastVerifyParams = null;
    this.lastCreateTokenPayload = null;
    this.lastVerifyTokenToken = null;
  }
}
