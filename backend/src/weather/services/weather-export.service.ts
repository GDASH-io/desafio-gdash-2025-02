import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import { ensureDatabaseConnection } from '../utils/database-helpers';
import { ExportException } from '../../common/exceptions/export.exception';
import * as ExcelJS from 'exceljs';

/**
 * Serviço para exportação de dados climáticos em diferentes formatos
 */
@Injectable()
export class WeatherExportService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  /**
   * Exporta logs climáticos em formato CSV
   *
   * @returns String CSV formatada
   * @throws ExportException se houver erro na exportação
   */
  async exportCsv(): Promise<string> {
    ensureDatabaseConnection(this.connection);

    try {
      const logs = await this.weatherLogModel.find().sort({ timestamp: -1 }).exec();

      // Cabeçalho CSV
      const header = 'timestamp,temperature,humidity,city\n';

      // Linhas de dados
      const rows = logs.map((log) => {
        const timestamp = log.timestamp || '';
        const temperature = log.temperature?.toString() || '';
        const humidity = log.humidity?.toString() || '';
        const city = log.city || '';

        return `${this.escapeCsv(timestamp)},${this.escapeCsv(temperature)},${this.escapeCsv(humidity)},${this.escapeCsv(city)}`;
      });

      return header + rows.join('\n');
    } catch (error) {
      throw new ExportException('CSV', error.message);
    }
  }

  /**
   * Exporta logs climáticos em formato XLSX
   *
   * @returns Workbook do ExcelJS
   * @throws ExportException se houver erro na exportação
   */
  async exportXlsx(): Promise<ExcelJS.Workbook> {
    ensureDatabaseConnection(this.connection);

    try {
      const logs = await this.weatherLogModel.find().sort({ timestamp: -1 }).exec();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Weather Logs');

      // Cabeçalhos
      worksheet.columns = [
        { header: 'timestamp', key: 'timestamp', width: 25 },
        { header: 'temperature', key: 'temperature', width: 15 },
        { header: 'humidity', key: 'humidity', width: 15 },
        { header: 'city', key: 'city', width: 20 },
      ];

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Adicionar dados
      logs.forEach((log) => {
        worksheet.addRow({
          timestamp: log.timestamp || '',
          temperature: log.temperature ?? '',
          humidity: log.humidity ?? '',
          city: log.city || '',
        });
      });

      return workbook;
    } catch (error) {
      throw new ExportException('XLSX', error.message);
    }
  }

  /**
   * Escapa valores CSV (vírgulas, aspas, quebras de linha)
   */
  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

