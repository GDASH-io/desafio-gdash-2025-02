import { AIRepository } from '@/domain/aplication/AI/AI-repository';
import { Climate } from '@/domain/enterprise/entities/climate';

export class FakeReport implements AIRepository {
  async report(climate: Climate[]): Promise<string> {
    return `the weather ${JSON.stringify(climate)} is wonderful`;
  }
}
