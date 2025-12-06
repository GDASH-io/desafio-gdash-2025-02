import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  TokenPayload,
  TokenProvider,
} from "@/domain/application/providers/providers/token-provider";

@Injectable()
export class JwtTokenProvider implements TokenProvider {
  constructor(private jwtService: JwtService) {}

  async generate(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verify(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token);
  }
}
