import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
export interface climateProps {
  timeStamp: Date;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  weatherCode: string;
}
export class Climate extends Entity<climateProps> {
  get timeStamp() {
    return this.props.timeStamp;
  }

  get temperature() {
    return this.props.temperature;
  }

  get windSpeed() {
    return this.props.windSpeed;
  }

  get windDirection() {
    return this.props.windDirection;
  }

  get weatherCode() {
    return this.props.weatherCode;
  }

  static create(props: climateProps, id?: UniqueEntityID) {
    const climate = new Climate(props, id);
    return climate;
  }
}
