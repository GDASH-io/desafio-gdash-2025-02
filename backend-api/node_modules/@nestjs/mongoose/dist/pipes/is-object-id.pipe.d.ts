import { PipeTransform } from '@nestjs/common';
export declare class IsObjectIdPipe implements PipeTransform {
    transform(value: string): string;
}
