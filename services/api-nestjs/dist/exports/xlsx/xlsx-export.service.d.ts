export declare class XlsxExportService {
    generateXlsxBuffer<T>(data: T[], headers?: (keyof T)[]): Promise<Buffer>;
}
