export interface AiAdapterPorts<TParams, TResult> {
  callAi(param: TParams | string, prompt: string): Promise<TResult | undefined>;
  generateEmbedding(input: string): Promise<number[] | undefined>;
}
