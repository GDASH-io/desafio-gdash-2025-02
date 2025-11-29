import { Module } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { TmdbController } from './tmdb.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TmdbService],
  controllers: [TmdbController],
  exports: [TmdbService], // Exportar para que outros módulos possam usar
})
export class TmdbModule {}
