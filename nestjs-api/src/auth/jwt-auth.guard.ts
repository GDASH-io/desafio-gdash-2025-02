import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// O 'jwt' aqui corresponde ao nome padrão da estratégia JWT do passport.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}