// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../resource.mjs";
import * as Core from "../../core.mjs";
export class Translations extends APIResource {
    /**
     * Translates audio into English.
     *
     * @example
     * ```ts
     * const translation = await client.audio.translations.create({
     *   model: 'whisper-large-v3-turbo',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/audio/translations', Core.multipartFormRequestOptions({ body, ...options }));
    }
}
//# sourceMappingURL=translations.mjs.map