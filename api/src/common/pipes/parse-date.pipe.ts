import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { formatDate } from 'src/utils/formatDate';
import { isDate } from 'src/utils/isDate';

@Injectable()
export class ParseIsDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value === 'undefined') {
      return '';
    }
    if (!isDate(value)) {
      throw new BadRequestException(
        `The parameter ${value} is not a valid date`,
      );
    }
    return formatDate({ date: new Date(value), onlyDate: true });
  }
}
