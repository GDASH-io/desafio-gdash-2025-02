// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../resource.mjs";
export class Embeddings extends APIResource {
    /**
     * Creates an embedding vector representing the input text.
     *
     * @example
     * ```ts
     * const createEmbeddingResponse =
     *   await client.embeddings.create({
     *     input: 'The quick brown fox jumped over the lazy dog',
     *     model: 'nomic-embed-text-v1_5',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/embeddings', { body, ...options });
    }
}
//# sourceMappingURL=embeddings.mjs.map