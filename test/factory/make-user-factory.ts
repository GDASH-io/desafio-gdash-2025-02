import { faker } from '@faker-js/faker';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { User, type userProps } from '@/domain/enterprise/entities/user';

export function MakeUser(
  override: Partial<userProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      userName: faker.internet.username(),
      name: faker.word.noun(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    },
    id,
  );
  return user;
}
