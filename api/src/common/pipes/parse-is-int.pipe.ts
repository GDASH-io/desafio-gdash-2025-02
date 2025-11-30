import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIsIntPipe implements PipeTransform {
  transform(value: string): number {
    if (!value || value === 'undefined') {
      return 0;
    }
    if (isNaN(Number(value))) {
      throw new BadRequestException(
        `The parameter ${value} is not a valid integer`,
      );
    }

    return Number(value);
  }
}
