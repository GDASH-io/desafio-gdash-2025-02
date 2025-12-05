import { PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
export declare class ParseObjectIdPipe implements PipeTransform {
    transform(value: string): Types.ObjectId;
}
