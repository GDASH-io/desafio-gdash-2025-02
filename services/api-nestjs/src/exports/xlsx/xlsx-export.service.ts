import { Injectable } from '@nestjs/common';
import * as XLSX from 'exceljs';

@Injectable()
export class XlsxExportService {
    async generateXlsxBuffer<T>(data: T[], headers?: (keyof T)[]): Promise<Buffer> {
        const workbook = new XLSX.Workbook();
        const worksheet = workbook.addWorksheet('Logs de Clima');

        const columns = headers ? headers.map(header => ({ header: String(header), key: String(header) })) :
            Object.keys(data[0] || {}).map(key => ({ header: key, key }));
        worksheet.columns = columns;

        data.forEach(item => {
            const row: any = {};
            columns.forEach(col => {
                row[col.key] = item[col.key as keyof T];
            });
            worksheet.addRow(row);
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
