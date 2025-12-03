import { Climate } from '@/domain/enterprise/entities/climate';

export abstract class AIRepository {
  abstract report(climate: Climate[]): Promise<string>;
}
