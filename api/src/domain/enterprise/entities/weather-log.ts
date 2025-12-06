import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface WeatherLogProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  skyCondition: string;
  rainProbability: number;
  location: string;
  collectedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export class WeatherLog extends Entity<WeatherLogProps> {
  get temperature(): number {
    return this.props.temperature;
  }

  get humidity(): number {
    return this.props.humidity;
  }

  get windSpeed(): number {
    return this.props.windSpeed;
  }

  get skyCondition(): string {
    return this.props.skyCondition;
  }

  get rainProbability(): number {
    return this.props.rainProbability;
  }

  get location(): string {
    return this.props.location;
  }

  get collectedAt(): Date {
    return this.props.collectedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  set temperature(value: number) {
    this.props.temperature = value;
    this.touch();
  }

  set humidity(value: number) {
    this.props.humidity = value;
    this.touch();
  }

  set windSpeed(value: number) {
    this.props.windSpeed = value;
    this.touch();
  }

  set skyCondition(value: string) {
    this.props.skyCondition = value;
    this.touch();
  }

  set rainProbability(value: number) {
    this.props.rainProbability = value;
    this.touch();
  }

  static create(props: WeatherLogProps, id?: UniqueEntityID): WeatherLog {
    const weatherLog = new WeatherLog(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );

    return weatherLog;
  }
}
