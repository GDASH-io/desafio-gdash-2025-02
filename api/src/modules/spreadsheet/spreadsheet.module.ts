import { Module } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { SpreadsheetAdapter } from './infraestructure/adapters/spreadsheet.adapter';
import { SpreadsheetService } from './spreadsheet.service';

@Module({
  providers: [
    SpreadsheetService,
    {
      provide: commonConstants.ports.SPREADSHEET,
      useClass: SpreadsheetAdapter,
    },
  ],
  exports: [SpreadsheetService],
})
export class SpreadsheetModule {}
