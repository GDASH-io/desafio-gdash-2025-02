import { PartialType } from '@nestjs/mapped-types';
import { CreateWeatherDto } from './create-weather.dto';

export class UpdateWeatherDto extends PartialType(CreateWeatherDto) {}
