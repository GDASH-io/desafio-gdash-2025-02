import { Injectable } from '@nestjs/common';
import { AiAdapterPorts } from '../../ports/ai.adapter.ports';
import { Insight } from '../../schemas/insigthOutputSchema';

@Injectable()
export class InMemoryAiAdapter implements AiAdapterPorts<string, Insight> {
  private mockInsight: Insight | undefined;
  private mockEmbedding: number[] | undefined;
  private shouldFailCallAi = false;
  private shouldFailEmbedding = false;
  private callAiCallCount = 0;
  private generateEmbeddingCallCount = 0;
  private callAiHistory: Array<{ param: string; prompt: string }> = [];
  private embeddingHistory: string[] = [];

  async callAi(param: string, prompt: string): Promise<Insight | undefined> {
    this.callAiCallCount++;
    this.callAiHistory.push({ param, prompt });

    if (this.shouldFailCallAi) {
      throw new Error('InMemory AI callAi failed');
    }

    return Promise.resolve(this.mockInsight);
  }

  async generateEmbedding(input: string): Promise<number[] | undefined> {
    this.generateEmbeddingCallCount++;
    this.embeddingHistory.push(input);

    if (this.shouldFailEmbedding) {
      throw new Error('InMemory AI generateEmbedding failed');
    }

    return Promise.resolve(this.mockEmbedding);
  }

  setMockInsight(insight: Insight | undefined): void {
    this.mockInsight = insight;
  }

  setMockEmbedding(embedding: number[] | undefined): void {
    this.mockEmbedding = embedding;
  }

  setShouldFailCallAi(shouldFail: boolean): void {
    this.shouldFailCallAi = shouldFail;
  }

  setShouldFailEmbedding(shouldFail: boolean): void {
    this.shouldFailEmbedding = shouldFail;
  }

  getCallAiCallCount(): number {
    return this.callAiCallCount;
  }

  getGenerateEmbeddingCallCount(): number {
    return this.generateEmbeddingCallCount;
  }

  getCallAiHistory(): Array<{ param: string; prompt: string }> {
    return [...this.callAiHistory];
  }

  getEmbeddingHistory(): string[] {
    return [...this.embeddingHistory];
  }

  getLastCallAiParams(): { param: string; prompt: string } | undefined {
    return this.callAiHistory[this.callAiHistory.length - 1];
  }

  getLastEmbeddingInput(): string | undefined {
    return this.embeddingHistory[this.embeddingHistory.length - 1];
  }

  reset(): void {
    this.mockInsight = undefined;
    this.mockEmbedding = undefined;
    this.shouldFailCallAi = false;
    this.shouldFailEmbedding = false;
    this.callAiCallCount = 0;
    this.generateEmbeddingCallCount = 0;
    this.callAiHistory = [];
    this.embeddingHistory = [];
  }

  setDefaultMockInsight(): void {
    this.mockInsight = {
      description:
        'Pleasant weather with moderate temperatures and clear skies.',
      activities: ['Walking', 'Cycling', 'Outdoor sports', 'Picnic'],
    };
  }

  setDefaultMockEmbedding(): void {
    this.mockEmbedding = Array.from(
      { length: 1536 },
      () => Math.random() * 0.1,
    );
  }

  setCustomMockInsight(description: string, activities: string[]): void {
    this.mockInsight = { description, activities };
  }

  setCustomMockEmbedding(size: number): void {
    this.mockEmbedding = Array.from({ length: size }, () => Math.random());
  }
}
