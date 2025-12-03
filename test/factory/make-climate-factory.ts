import { faker } from '@faker-js/faker';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Climate,
  type climateProps,
} from '@/domain/enterprise/entities/climate';

export function MakeClimate(
  override: Partial<climateProps> = {},
  id?: UniqueEntityID,
) {
  const climate = Climate.create(
    {
      temperature: faker.number.float({ min: -10, max: 45 }),
      timeStamp: faker.date.recent(),
      weatherCode: faker.helpers.arrayElement([
        'sunny',
        'rain',
        'storm',
        'snow',
        'cloudy',
        'fog',
      ]),
      windDirection: faker.helpers.arrayElement([
        'N',
        'NE',
        'E',
        'SE',
        'S',
        'SW',
        'W',
        'NW',
      ]),
      windSpeed: faker.number.float({ min: 0, max: 100 }),
    },
    id,
  );
  return climate;
}
