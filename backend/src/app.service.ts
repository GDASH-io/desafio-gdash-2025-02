import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Weathernator API - Sistema de Monitoramento Climático';
  }
}
