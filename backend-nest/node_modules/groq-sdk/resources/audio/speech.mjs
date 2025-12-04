// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../resource.mjs";
export class Speech extends APIResource {
    /**
     * Generates audio from the input text.
     *
     * @example
     * ```ts
     * const speech = await client.audio.speech.create({
     *   input: 'The quick brown fox jumped over the lazy dog',
     *   model: 'playai-tts',
     *   voice: 'Fritz-PlayAI',
     * });
     *
     * const content = await speech.blob();
     * console.log(content);
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/audio/speech', {
            body,
            ...options,
            headers: { Accept: 'audio/wav', ...options?.headers },
            __binaryResponse: true,
        });
    }
}
//# sourceMappingURL=speech.mjs.map