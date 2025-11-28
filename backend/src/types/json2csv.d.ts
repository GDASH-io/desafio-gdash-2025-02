declare module 'json2csv' {
    export class Parser<T = Record<string, unknown>> {
        constructor(opts?: Record<string, unknown>);
        parse(data: T[]): string;
    }
}