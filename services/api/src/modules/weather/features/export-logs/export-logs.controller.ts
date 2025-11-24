import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportLogsService } from './export-logs.service';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.WEATHER.BASE)
@UseGuards(JwtAuthGuard)
export class ExportLogsController {
  constructor(private readonly exportLogsService: ExportLogsService) {}

  @Get('export/csv')
  async exportCSV(@Res() res: Response) {
    const buffer = await this.exportLogsService.exportToCSV();
    
    const filename = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Get('export/xlsx')
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.exportLogsService.exportToXLSX();
    
    const filename = `weather-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }
}
