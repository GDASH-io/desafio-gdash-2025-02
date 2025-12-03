import { NotFoundException } from '@nestjs/common';

export class WeatherNotFoundException extends NotFoundException {
  constructor(id?: string) {
    super(
      id
        ? `Weather log with ID ${id} not found`
        : 'Weather log not found'
    );
  }
}

