import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Climate } from '@/domain/enterprise/entities/climate';
import { Climate as PrismaClient } from '@prisma/client';

export class PrismaClimateMapper {
  static toDomain(raw: PrismaClient): Climate {
    return Climate.create(
      {
        timeStamp: raw.timeStamp,
        temperature: raw.temperature,
        windSpeed: raw.windSpeed,
        windDirection: raw.windDirection,
        weatherCode: raw.weatherCode,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPrisma(climate: Climate): PrismaClient {
    return {
      id: climate.id.toString(),
      timeStamp: climate.timeStamp,
      temperature: climate.temperature,
      windSpeed: climate.windSpeed,
      windDirection: climate.windDirection,
      weatherCode: climate.weatherCode,
      createdAt: new Date(),
    };
  }
}
