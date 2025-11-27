export class CreateWeatherDto {
  readonly temperature: number;
  readonly humidity: number;
  readonly pressure: number;
  readonly windSpeed: number;
  readonly city: string;
  readonly recordeAt: Date;
}
