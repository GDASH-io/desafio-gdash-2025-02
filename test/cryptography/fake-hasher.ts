import type { HashComparer } from '@/domain/aplication/cryptography/hash-comparer';
import type { HashGenerator } from '@/domain/aplication/cryptography/hash-generator';

export class FakeHasher implements HashComparer, HashGenerator {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed');
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash;
  }
}
