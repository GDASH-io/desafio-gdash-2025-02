import type { Climate } from '@/domain/enterprise/entities/climate';

export abstract class ClimateRepository {
  abstract create(climate: Climate): Promise<void>;
  abstract findById(id: string): Promise<Climate | null>;
  abstract findManyRecent(page: number): Promise<Climate[]>;
  abstract delete(id: string): Promise<null>;
}
