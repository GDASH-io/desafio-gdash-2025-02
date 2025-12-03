import { PartialType } from '@nestjs/mapped-types';
import { CreateInsightsWeatherDto } from './create-insights-weather.dto';

export class UpdateInsightsWeatherDto extends PartialType(CreateInsightsWeatherDto) {}
