/* eslint-disable @typescript-eslint/await-thenable */
export class Saga<TFallbackResult> {
  private compensations: (() => Promise<TFallbackResult>)[] = [];

  addCompensation(fn: () => Promise<TFallbackResult>) {
    this.compensations.unshift(fn);
  }

  async run<TResult>(fn: () => Promise<TResult>) {
    try {
      return await fn();
    } catch {
      return await this.compensate();
    }
  }

  async compensate() {
    for await (const compensation of this.compensations) {
      try {
        return await compensation();
      } catch {
        // Log compensation failure but continue with other compensations
      }
    }
  }
}
