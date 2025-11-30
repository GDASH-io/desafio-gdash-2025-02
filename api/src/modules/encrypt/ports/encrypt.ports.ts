export interface EncryptPort {
  encrypt(password: string): Promise<string>;
  verify(encryptedPassword: string, password: string): Promise<boolean>;
  createAuthToken<T extends object>(payload: T): Promise<string>;
  verifyAuthToken<T extends object>(token: string): T;
}
