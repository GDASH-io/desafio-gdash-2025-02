import { ClimateExport } from '@/domain/aplication/export/climate-export';
import { Module } from '@nestjs/common';
import { FileTypeExport } from './file-type-export';

@Module({
  providers: [{ provide: ClimateExport, useClass: FileTypeExport }],
  exports: [ClimateExport],
})
export class ExportModule {}
