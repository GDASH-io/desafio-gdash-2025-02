import { VirtualTypeOptions } from 'mongoose';
export interface VirtualOptions {
    options?: VirtualTypeOptions;
    subPath?: string;
    get?: (...args: any[]) => any;
    set?: (...args: any[]) => any;
}
export declare function Virtual(options?: VirtualOptions): PropertyDecorator;
