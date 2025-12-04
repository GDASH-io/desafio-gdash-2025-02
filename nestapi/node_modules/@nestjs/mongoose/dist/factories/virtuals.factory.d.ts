import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
export declare class VirtualsFactory {
    static inspect<TClass = any>(target: Type<TClass>, schema: mongoose.Schema<TClass>): void;
}
