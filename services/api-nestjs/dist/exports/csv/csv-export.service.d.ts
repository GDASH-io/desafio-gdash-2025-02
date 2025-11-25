import { Readable } from 'stream';
export declare class CsvExportService {
    generateCsvStream<T>(data: T[], headers?: (keyof T)[]): Readable;
}
