import { HashComparer } from '@/domain/aplication/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/aplication/cryptography/hash-generator';
import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }

  async hash(plain: string): Promise<string> {
    return hash(plain, 8);
  }
}
