import { Injectable } from '@nestjs/common';
import { format } from 'fast-csv';
import { Readable, Stream } from 'stream';

@Injectable()
export class CsvExportService {
    
    generateCsvStream<T>(data: T[], headers?: (keyof T)[]): Readable {
        const csvStream = format({ headers: headers ? headers as string[] : true });

        data.forEach(item => {
            const row: Record<string, any> = {};
            headers?.forEach((header) => {
                row[String(header)] = item[header];
            })
            csvStream.write(row);
        });
        csvStream.end();
        return csvStream;
    }
}