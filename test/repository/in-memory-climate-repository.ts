import type { ClimateRepository } from '@/domain/aplication/repository/climate-repository';
import type { Climate } from '@/domain/enterprise/entities/climate';

export class InMemoryClimateRepository implements ClimateRepository {
  public items: Climate[] = [];

  async create(climate: Climate): Promise<void> {
    this.items.push(climate);
  }

  async findById(id: string): Promise<Climate | null> {
    const climate = this.items.find((item) => item.id.toString() == id);
    if (!climate) {
      return null;
    }
    return climate;
  }

  async delete(id: string): Promise<null> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() == id);
    this.items.splice(itemIndex, 1);
    return null;
  }

  async findManyRecent(page: number): Promise<Climate[]> {
    const climate = this.items.slice((page - 1) * 10, page * 10);
    return climate;
  }
}
