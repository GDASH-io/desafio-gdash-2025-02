export class WeatherEntity {
  constructor(
    public readonly city: string,
    public readonly temperature: number,
    public readonly humidity: number,
    public readonly windSpeed: number,
    public readonly condition: string,
    public readonly timestamp: Date,
    public readonly id?: string,
  ) {}
}
