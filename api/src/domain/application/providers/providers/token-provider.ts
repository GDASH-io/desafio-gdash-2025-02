export interface TokenPayload {
  sub: string;
  role: string;
}

export abstract class TokenProvider {
  abstract generate(payload: TokenPayload): Promise<string>;
  abstract verify(token: string): Promise<TokenPayload>;
}
