import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { HashProvider } from "@/domain/application/providers/hash-provider";

@Injectable()
export class BcryptHashProvider implements HashProvider {
  private HASH_SALT_LENGTH = 8;

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
