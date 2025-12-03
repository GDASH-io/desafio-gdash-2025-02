import { Injectable, Logger } from "@nestjs/common";
import * as Papa from 'papaparse'
import * as ExcelJS from 'exceljs'

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    async exportToCsv(data: any[]): Promise<string> {
        try {
            const formatted = this.formatDataForExport(data);
            const csv = Papa.unparse(formatted);
            this.logger.log(`Exported ${data.length} records to CSV`);
            return csv;
        } catch (error) {
            this.logger.error('Failed to export CSV', error.stack);
            throw new Error('Failed to export data to CSV');
        }
    }

    async exportToXLSX(data: any[]): Promise<ExcelJS.Buffer> {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Weather Data');

            worksheet.columns = [
                { header: 'Data/Hora', key: 'timestamp', width: 20 },
                { header: 'Cidade', key: 'city', width: 20 },
                { header: 'Latitude', key: 'latitude', width: 12 },
                { header: 'Longitude', key: 'longitude', width: 12 },
                { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
                { header: 'Sensação Térmica (°C)', key: 'apparentTemperature', width: 18 },
                { header: 'Umidade (%)', key: 'humidity', width: 12 },
                { header: 'Pressão (hPa)', key: 'pressure', width: 12 },
                { header: 'Vento (km/h)', key: 'windSpeed', width: 12 },
                { header: 'Direção do Vento (°)', key: 'windDirection', width: 18 },
                { header: 'Precipitação (mm)', key: 'precipitation', width: 15 },
                { header: 'Cobertura Nuvens (%)', key: 'cloudCover', width: 18 },
                { header: 'Código Clima', key: 'weatherCode', width: 12 },
            ];

            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF'} };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' },
            };
            
            const formatted = this.formatDataForExport(data);
            formatted.forEach((row) => {
                worksheet.addRow(row);
            });

            worksheet.getColumn('temperature').numFmt = '0.0';
            worksheet.getColumn('humidity').numFmt = '0.0';
            worksheet.getColumn('windSpeed').numFmt = '0.0';

            worksheet.autoFilter = {
                from: 'A1',
                to: 'N1',
            };

            const buffer = await workbook.xlsx.writeBuffer();
            this.logger.log(`Exported ${data.length} records to XLSX`);
            return buffer;
        } catch (error) {
            this.logger.error('Failed to export XLSX', error.stack);
            throw new Error('Failed to export data to XLSX');
        }
    }

    private formatDataForExport(data: any[]): any[] {
        return data.map((item) => ({
            timestamp: new Date(item.timestamp).toLocaleString('pt-BR'),
            city: item.location.city,
            latitude: item.location.latitude,
            longitude: item.location.longitude,
            temperature: item.location.temperature,
            apparentTemperature: item.apparentTemperature,
            humidity: item.humidity,
            pressure: item.pressure,
            windSpeed: item.windSpeed,
            windDirection: item.windDirection,
            precipitation: item.precipitation,
            cloudCover: item.cloudCover,
            weatherCode: item.weatherCode,
        }));
    }


}